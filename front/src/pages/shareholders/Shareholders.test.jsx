import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import theme from '../../theme'
import { fetchShareholders } from '../../services/shareholderService'
import Shareholders from './Shareholders'

vi.mock('../../services/shareholderService', () => ({ fetchShareholders: vi.fn() }))

const TABLE_COLUMNS = ['Accionista', 'Representante', 'Nº de acciones', '% de acciones', 'Capital social']
const PAGE_SIZE = 20

const companyShareholder = {
  id: 1,
  first_name: 'Inversiones Levante S.L.',
  last_name: null,
  representative_name: 'María López García',
  shares_count: 54309,
  shares_percentage: '41.7800',
  share_capital: '326397.09',
  tax_id: 'B12345678',
  email: 'contacto@levante.es',
  phone: '600111222',
  address: 'Calle Mayor 1, Murcia',
}

const personShareholder = {
  id: 2,
  first_name: 'Luis',
  last_name: 'Pérez Martín',
  representative_name: null,
  shares_count: 2240,
  shares_percentage: '1.7200',
  share_capital: '13462.40',
  tax_id: '12345678Z',
  email: 'luis.perez@correo.es',
  phone: '611222333',
  address: 'Avenida Libertad 5, Madrid',
}

const PERSONAL_DATA = [companyShareholder, personShareholder].flatMap((shareholder) => [
  shareholder.tax_id,
  shareholder.email,
  shareholder.phone,
  shareholder.address,
])

const buildShareholdersPage = ({ items = [companyShareholder, personShareholder], total = items.length, page = 1 } = {}) => ({
  items,
  total,
  page,
  size: PAGE_SIZE,
})

const setScreen = (isDesktop) =>
  vi.stubGlobal('matchMedia', (query) => ({
    matches: isDesktop,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

const renderShareholders = () =>
  render(
    <ThemeProvider theme={theme}>
      <Shareholders />
    </ThemeProvider>,
  )

const getRowTexts = (row) => within(row).getAllByRole('cell').map((cell) => cell.textContent)

describe('Shareholders', () => {
  beforeEach(() => {
    fetchShareholders.mockResolvedValue(buildShareholdersPage())
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows a loading indicator while the shareholders are being fetched', () => {
    fetchShareholders.mockReturnValue(new Promise(() => {}))
    setScreen(true)
    renderShareholders()

    expect(screen.getByRole('progressbar', { name: 'Cargando accionistas' })).toBeTruthy()
  })

  it('shows the shareholders table with its columns and formatted values on desktop', async () => {
    setScreen(true)
    renderShareholders()

    const table = await screen.findByRole('table', { name: 'Composición del accionariado' })
    const columnNames = within(table)
      .getAllByRole('columnheader')
      .map((column) => column.textContent)
    const [, companyRow, personRow] = within(table).getAllByRole('row')

    expect(columnNames).toEqual(TABLE_COLUMNS)
    expect(getRowTexts(companyRow)).toEqual([
      'Inversiones Levante S.L.',
      'María López García',
      '54.309',
      '41,78 %',
      '326.397,09 €',
    ])
    expect(getRowTexts(personRow)).toEqual(['Luis Pérez Martín', '—', '2.240', '1,72 %', '13.462,40 €'])
  })

  it('shows one card per shareholder on mobile', async () => {
    setScreen(false)
    renderShareholders()

    const cards = await screen.findAllByRole('article')

    expect(cards).toHaveLength(2)
    expect(within(cards[0]).getByRole('heading', { name: 'Inversiones Levante S.L.' })).toBeTruthy()
    expect(within(cards[0]).getByText('Representante: María López García')).toBeTruthy()
    expect(within(cards[1]).getByText('Sin representante')).toBeTruthy()
    expect(within(cards[1]).getByText('1,72 %')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it.each([
    ['desktop', true],
    ['mobile', false],
  ])('never shows personal data on %s', async (screenName, isDesktop) => {
    setScreen(isDesktop)
    renderShareholders()

    await screen.findByText('Luis Pérez Martín')
    const pageText = document.body.textContent

    PERSONAL_DATA.forEach((personalValue) => {
      expect(pageText).not.toContain(personalValue)
    })
  })

  it('shows a message when there are no shareholders', async () => {
    fetchShareholders.mockResolvedValue(buildShareholdersPage({ items: [] }))
    setScreen(true)
    renderShareholders()

    expect(await screen.findByText('Todavía no hay accionistas registrados.')).toBeTruthy()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('shows the error message when the shareholders cannot be loaded', async () => {
    const errorMessage = 'No se ha podido cargar el listado de accionistas. Inténtelo de nuevo más tarde.'
    fetchShareholders.mockRejectedValue(new Error(errorMessage))
    setScreen(true)
    renderShareholders()

    expect((await screen.findByRole('alert')).textContent).toBe(errorMessage)
  })

  it('does not show the pagination when all shareholders fit on one page', async () => {
    setScreen(true)
    renderShareholders()

    await screen.findByRole('table')

    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('fetches the selected page when the user changes page', async () => {
    fetchShareholders.mockResolvedValue(buildShareholdersPage({ total: 45 }))
    setScreen(true)
    renderShareholders()

    const pagination = await screen.findByRole('navigation')
    fireEvent.click(within(pagination).getByRole('button', { name: 'Go to page 2' }))

    await screen.findByRole('table')
    expect(fetchShareholders).toHaveBeenNthCalledWith(1, 1)
    expect(fetchShareholders).toHaveBeenLastCalledWith(2)
  })
})
