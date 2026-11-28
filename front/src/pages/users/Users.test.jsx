import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Users from './Users'
import { getUsers } from '../../api/usersApi'

vi.mock('../../api/usersApi', () => ({ getUsers: vi.fn() }))

const SEARCH_LABEL = 'Buscar por nombre, apellidos o email'
const ROLE_SELECT = 0
const STATUS_SELECT = 1
const ROWS_PER_PAGE_SELECT = 2

const buildUser = (id, overrides = {}) => ({
  id,
  first_name: `Nombre${id}`,
  last_name: `Apellido${id}`,
  email: `user${id}@example.com`,
  tax_id: `0000000${id}T`,
  role: 'user',
  person_type: 'individual',
  phone: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

const buildPage = (items, total = items.length) => ({ items, total, page: 1, size: 10 })

const buildUsers = (count) => Array.from({ length: count }, (_, index) => buildUser(index + 1))

const renderUsers = () =>
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>,
  )

const chooseOption = (selectIndex, optionName) => {
  fireEvent.mouseDown(screen.getAllByRole('combobox')[selectIndex])
  fireEvent.click(screen.getByRole('option', { name: optionName }))
}

const expectLastRequest = (params) =>
  waitFor(() => expect(getUsers).toHaveBeenLastCalledWith(params))

describe('Users', () => {
  beforeEach(() => {
    getUsers.mockReset()
    getUsers.mockResolvedValue(buildPage(buildUsers(2)))
  })

  afterEach(cleanup)

  describe('listing', () => {
    it('requests the first page and shows the users returned by the API', async () => {
      getUsers.mockResolvedValue(buildPage([buildUser(1), buildUser(2, { is_active: false })]))
      renderUsers()

      expect(await screen.findByText('Nombre1 Apellido1')).toBeTruthy()
      expect(screen.getByText('Nombre2 Apellido2')).toBeTruthy()
      expect(screen.getByText('Activo')).toBeTruthy()
      expect(screen.getByText('Inactivo')).toBeTruthy()
      expect(getUsers).toHaveBeenCalledWith({ page: 1, size: 10 })
    })

    it('links each user to the detail page', async () => {
      renderUsers()

      const link = await screen.findByRole('link', { name: 'Nombre1 Apellido1' })
      expect(link.getAttribute('href')).toBe('/management/users/1')
    })

    it('shows a message when there are no users', async () => {
      getUsers.mockResolvedValue(buildPage([]))
      renderUsers()

      expect(await screen.findByText('No se han encontrado usuarios.')).toBeTruthy()
    })

    it('shows an error message when the request fails', async () => {
      getUsers.mockRejectedValue(new Error('network'))
      renderUsers()

      expect(await screen.findByText(/No se ha podido cargar el listado/)).toBeTruthy()
    })
  })

  describe('search', () => {
    it('sends the trimmed search text to the API', async () => {
      renderUsers()
      await screen.findByText('Nombre1 Apellido1')

      fireEvent.change(screen.getByLabelText(SEARCH_LABEL), { target: { value: '  garcia  ' } })

      await expectLastRequest({ page: 1, size: 10, search: 'garcia' })
    })

    it('does not send a request for every keystroke', async () => {
      renderUsers()
      await screen.findByText('Nombre1 Apellido1')
      getUsers.mockClear()

      const input = screen.getByLabelText(SEARCH_LABEL)
      fireEvent.change(input, { target: { value: 'g' } })
      fireEvent.change(input, { target: { value: 'ga' } })
      fireEvent.change(input, { target: { value: 'gar' } })

      await expectLastRequest({ page: 1, size: 10, search: 'gar' })
      expect(getUsers).toHaveBeenCalledTimes(1)
    })
  })

  describe('filters', () => {
    it('filters by role', async () => {
      renderUsers()
      await screen.findByText('Nombre1 Apellido1')

      chooseOption(ROLE_SELECT, 'Administrador')

      await expectLastRequest({ page: 1, size: 10, role: 'admin' })
    })

    it('filters by active status', async () => {
      renderUsers()
      await screen.findByText('Nombre1 Apellido1')

      chooseOption(STATUS_SELECT, 'Activos')

      await expectLastRequest({ page: 1, size: 10, is_active: true })
    })

    it('filters by inactive status', async () => {
      renderUsers()
      await screen.findByText('Nombre1 Apellido1')

      chooseOption(STATUS_SELECT, 'Inactivos')

      await expectLastRequest({ page: 1, size: 10, is_active: false })
    })

    it('combines role and status filters', async () => {
      renderUsers()
      await screen.findByText('Nombre1 Apellido1')

      chooseOption(ROLE_SELECT, 'Manager')
      await expectLastRequest({ page: 1, size: 10, role: 'manager' })
      chooseOption(STATUS_SELECT, 'Inactivos')

      await expectLastRequest({ page: 1, size: 10, role: 'manager', is_active: false })
    })

    it('removes a filter when "Todos" is selected again', async () => {
      renderUsers()
      await screen.findByText('Nombre1 Apellido1')

      chooseOption(ROLE_SELECT, 'Administrador')
      await expectLastRequest({ page: 1, size: 10, role: 'admin' })
      chooseOption(ROLE_SELECT, 'Todos')

      await expectLastRequest({ page: 1, size: 10 })
    })
  })

  describe('pagination', () => {
    beforeEach(() => {
      getUsers.mockResolvedValue(buildPage(buildUsers(10), 25))
    })

    it('shows the range and the total of users', async () => {
      renderUsers()

      expect(await screen.findByText('1–10 de 25')).toBeTruthy()
    })

    it('requests the next page', async () => {
      renderUsers()
      await screen.findByText('1–10 de 25')

      fireEvent.click(screen.getByLabelText(/next page/i))

      await expectLastRequest({ page: 2, size: 10 })
    })

    it('requests the previous page', async () => {
      renderUsers()
      await screen.findByText('1–10 de 25')
      fireEvent.click(screen.getByLabelText(/next page/i))
      await expectLastRequest({ page: 2, size: 10 })

      fireEvent.click(screen.getByLabelText(/previous page/i))

      await expectLastRequest({ page: 1, size: 10 })
    })

    it('changes the page size and goes back to the first page', async () => {
      renderUsers()
      await screen.findByText('1–10 de 25')
      fireEvent.click(screen.getByLabelText(/next page/i))
      await expectLastRequest({ page: 2, size: 10 })

      chooseOption(ROWS_PER_PAGE_SELECT, '25')

      await expectLastRequest({ page: 1, size: 25 })
    })

    it('goes back to the first page when a filter changes', async () => {
      renderUsers()
      await screen.findByText('1–10 de 25')
      fireEvent.click(screen.getByLabelText(/next page/i))
      await expectLastRequest({ page: 2, size: 10 })

      chooseOption(ROLE_SELECT, 'Administrador')

      await expectLastRequest({ page: 1, size: 10, role: 'admin' })
    })
  })
})