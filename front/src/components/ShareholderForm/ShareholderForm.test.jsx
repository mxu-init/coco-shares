import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import ShareholderForm from './ShareholderForm'
import api from '../../services/api'
import {
  INVALID_REPRESENTATIVE_NAME_MESSAGE,
  INVALID_REPRESENTATIVE_TAX_ID_MESSAGE,
  INVALID_SHARE_CAPITAL_MESSAGE,
  INVALID_SHARES_COUNT_MESSAGE,
  INVALID_SHARES_PERCENTAGE_MESSAGE,
} from './shareholderFormValidation'

vi.mock('../../services/api', () => ({
  default: { post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const USER_ID = 7
const SHAREHOLDER_PATH = `/users/${USER_ID}/shareholder`
const SHARES_COUNT_LABEL = 'Nº de acciones'
const SHARES_PERCENTAGE_LABEL = '% de acciones'
const SHARE_CAPITAL_LABEL = 'Capital social (€)'
const REPRESENTATIVE_NAME_LABEL = 'Representante (opcional)'
const REPRESENTATIVE_TAX_ID_LABEL = 'NIF del representante (opcional)'
const SAVE_ERROR = 'No se ha podido guardar la ficha de accionista. Inténtelo de nuevo más tarde.'
const DUPLICATED_MESSAGE = 'El usuario ya tiene una ficha de accionista'
const HAS_FORMS_MESSAGE = 'No se puede eliminar la ficha porque tiene boletines de representación'

const VALID_VALUES = {
  [SHARES_COUNT_LABEL]: '150',
  [SHARES_PERCENTAGE_LABEL]: '0,33',
  [SHARE_CAPITAL_LABEL]: '1500,50',
}

const SHAREHOLDER = {
  id: 3,
  user_id: USER_ID,
  shares_count: 150,
  shares_percentage: '0.3300',
  share_capital: '1500.50',
  representative_name: null,
  representative_tax_id: null,
}

const apiError = (status, data) => Object.assign(new Error('Request failed'), { response: { status, data } })

const renderForm = (props = {}) => {
  const onShareholderChange = vi.fn()
  render(<ShareholderForm userId={USER_ID} showForm onShareholderChange={onShareholderChange} {...props} />)
  return onShareholderChange
}

const fillField = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

const fillForm = (values) => Object.entries(values).forEach(([label, value]) => fillField(label, value))

const submitForm = (buttonName = 'Crear ficha') => fireEvent.click(screen.getByRole('button', { name: buttonName }))

const submitWith = (overrides) => {
  fillForm({ ...VALID_VALUES, ...overrides })
  submitForm()
}

describe('ShareholderForm', () => {
  beforeEach(() => {
    api.post.mockReset()
    api.patch.mockReset()
    api.delete.mockReset()
    api.post.mockResolvedValue({ data: SHAREHOLDER })
    api.patch.mockResolvedValue({ data: SHAREHOLDER })
    api.delete.mockResolvedValue({})
  })

  afterEach(cleanup)

  describe('ranges', () => {
    it.each(['-1', '1.5', 'abc'])('rejects %s as number of shares', (value) => {
      renderForm()
      submitWith({ [SHARES_COUNT_LABEL]: value })

      expect(screen.getByText(INVALID_SHARES_COUNT_MESSAGE)).toBeTruthy()
      expect(api.post).not.toHaveBeenCalled()
    })

    it.each(['100,0001', '12,12345', '-1'])('rejects %s as percentage of shares', (value) => {
      renderForm()
      submitWith({ [SHARES_PERCENTAGE_LABEL]: value })

      expect(screen.getByText(INVALID_SHARES_PERCENTAGE_MESSAGE)).toBeTruthy()
      expect(api.post).not.toHaveBeenCalled()
    })

    it.each(['-1', '10,123'])('rejects %s as share capital', (value) => {
      renderForm()
      submitWith({ [SHARE_CAPITAL_LABEL]: value })

      expect(screen.getByText(INVALID_SHARE_CAPITAL_MESSAGE)).toBeTruthy()
      expect(api.post).not.toHaveBeenCalled()
    })

    it('rejects a representative and a representative tax id that are too long', () => {
      renderForm()
      submitWith({
        [REPRESENTATIVE_NAME_LABEL]: 'a'.repeat(201),
        [REPRESENTATIVE_TAX_ID_LABEL]: '1'.repeat(21),
      })

      expect(screen.getByText(INVALID_REPRESENTATIVE_NAME_MESSAGE)).toBeTruthy()
      expect(screen.getByText(INVALID_REPRESENTATIVE_TAX_ID_MESSAGE)).toBeTruthy()
      expect(api.post).not.toHaveBeenCalled()
    })

    it.each([
      ['0', '0', '0'],
      ['0', '100', '10,12'],
      ['25', '0,33', '1500'],
    ])('accepts %s shares, %s %% and %s € of capital', async (sharesCount, sharesPercentage, shareCapital) => {
      renderForm()
      submitWith({
        [SHARES_COUNT_LABEL]: sharesCount,
        [SHARES_PERCENTAGE_LABEL]: sharesPercentage,
        [SHARE_CAPITAL_LABEL]: shareCapital,
      })

      await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1))
    })
  })

  describe('sent data', () => {
    it('converts the decimal comma to a point and sends empty optional fields as null', async () => {
      const onShareholderChange = renderForm()
      submitWith({ [SHARES_PERCENTAGE_LABEL]: '12,5' })

      await waitFor(() => expect(onShareholderChange).toHaveBeenCalledWith(SHAREHOLDER))
      expect(api.post).toHaveBeenCalledWith(SHAREHOLDER_PATH, {
        shares_count: 150,
        shares_percentage: '12.5',
        share_capital: '1500.50',
        representative_name: null,
        representative_tax_id: null,
      })
    })

    it('sends only the changed fields when editing', async () => {
      renderForm({ shareholder: SHAREHOLDER })
      fillField(SHARES_COUNT_LABEL, '200')
      submitForm('Guardar cambios')

      await waitFor(() => expect(api.patch).toHaveBeenCalledWith(SHAREHOLDER_PATH, { shares_count: 200 }))
    })
  })

  describe('API errors', () => {
    it('shows the message of a duplicated record', async () => {
      api.post.mockRejectedValue(apiError(409, { detail: DUPLICATED_MESSAGE }))
      renderForm()
      submitWith({})

      expect(await screen.findByText(DUPLICATED_MESSAGE)).toBeTruthy()
    })

    it('shows the invalid fields returned by the API', async () => {
      api.post.mockRejectedValue(
        apiError(422, {
          detail: 'Los datos enviados no son válidos',
          errors: [{ loc: ['body', 'shares_percentage'] }, { loc: ['body', 'share_capital'] }],
        }),
      )
      renderForm()
      submitWith({})

      expect(await screen.findByText('Revise estos campos: % de acciones, Capital social.')).toBeTruthy()
    })

    it('shows a generic message when the server fails', async () => {
      api.post.mockRejectedValue(apiError(500, { detail: 'Internal Server Error' }))
      renderForm()
      submitWith({})

      expect(await screen.findByText(SAVE_ERROR)).toBeTruthy()
      expect(screen.queryByText('Internal Server Error')).toBeNull()
    })

    it('keeps the record when it cannot be deleted because it has representation forms', async () => {
      api.delete.mockRejectedValue(apiError(409, { detail: HAS_FORMS_MESSAGE }))
      const onShareholderChange = renderForm({ shareholder: SHAREHOLDER })
      fireEvent.click(screen.getByRole('button', { name: 'Eliminar ficha' }))
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar ficha' }))

      expect(await screen.findByText(HAS_FORMS_MESSAGE)).toBeTruthy()
      expect(api.delete).toHaveBeenCalledWith(SHAREHOLDER_PATH)
      expect(onShareholderChange).not.toHaveBeenCalled()
      expect(screen.getByLabelText(SHARES_COUNT_LABEL).value).toBe('150')
    })
  })
})
