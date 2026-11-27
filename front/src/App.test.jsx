import { cleanup, render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import theme from './theme'
import { fetchCurrentUser } from './services/authService'
import { saveToken } from './services/sessionService'
import { fetchShareholders } from './services/shareholderService'

vi.mock('./services/authService', () => ({ fetchCurrentUser: vi.fn(), login: vi.fn() }))
vi.mock('./services/shareholderService', () => ({ fetchShareholders: vi.fn() }))

const SHAREHOLDERS_PATH = '/shareholders'
const EMPTY_SHAREHOLDERS_PAGE = { items: [], total: 0, page: 1, size: 20 }
const CURRENT_USER = { id: 1, first_name: 'Luis', last_name: 'Martín López', role: 'user' }

const renderApp = (path) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    fetchShareholders.mockResolvedValue(EMPTY_SHAREHOLDERS_PAGE)
  })

  afterEach(cleanup)

  it('sends visitors who open a private page to the login page', async () => {
    renderApp(SHAREHOLDERS_PATH)

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(fetchShareholders).not.toHaveBeenCalled()
  })

  it('shows the private page and the user details to logged in users', async () => {
    saveToken('abc123')
    fetchCurrentUser.mockResolvedValue(CURRENT_USER)

    renderApp(SHAREHOLDERS_PATH)

    expect(await screen.findByRole('heading', { name: 'Composición del accionariado' })).toBeTruthy()
    expect(screen.getByText('Luis Martín López')).toBeTruthy()
  })
})
