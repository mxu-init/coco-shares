import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import theme from '../../theme'
import { login } from '../../services/authService'
import Login from './Login'
import {
  INVALID_EMAIL_MESSAGE,
  REQUIRED_EMAIL_MESSAGE,
  REQUIRED_PASSWORD_MESSAGE,
} from './loginFormValidation'

vi.mock('../../services/authService', () => ({ login: vi.fn() }))

const PRIVATE_PAGE_CONTENT = 'Zona privada'
const INVALID_CREDENTIALS_MESSAGE = 'Email o contraseña incorrectos'

const renderLogin = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>{PRIVATE_PAGE_CONTENT}</p>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )

const fillForm = ({ email = '', password = '' }) => {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } })
}

const submitForm = () => fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

describe('Login', () => {
  beforeEach(() => {
    login.mockReset()
  })

  afterEach(cleanup)

  it('shows the required field errors and does not call the API', () => {
    renderLogin()

    submitForm()

    expect(screen.getByText(REQUIRED_EMAIL_MESSAGE)).toBeTruthy()
    expect(screen.getByText(REQUIRED_PASSWORD_MESSAGE)).toBeTruthy()
    expect(login).not.toHaveBeenCalled()
  })

  it('shows an error when the email format is not valid', () => {
    renderLogin()
    fillForm({ email: 'ana.example.com', password: 'Password123' })

    submitForm()

    expect(screen.getByText(INVALID_EMAIL_MESSAGE)).toBeTruthy()
    expect(login).not.toHaveBeenCalled()
  })

  it('shows the credentials error returned by the API', async () => {
    login.mockRejectedValue(new Error(INVALID_CREDENTIALS_MESSAGE))
    renderLogin()
    fillForm({ email: 'ana@example.com', password: 'WrongPass123' })

    submitForm()

    expect(await screen.findByText(INVALID_CREDENTIALS_MESSAGE)).toBeTruthy()
    expect(screen.queryByText(PRIVATE_PAGE_CONTENT)).toBeNull()
  })

  it('logs in and redirects to the private area', async () => {
    login.mockResolvedValue({ access_token: 'abc123', token_type: 'bearer' })
    renderLogin()
    fillForm({ email: 'ana@example.com', password: 'Password123' })

    submitForm()

    expect(await screen.findByText(PRIVATE_PAGE_CONTENT)).toBeTruthy()
    expect(login).toHaveBeenCalledWith('ana@example.com', 'Password123')
  })
})
