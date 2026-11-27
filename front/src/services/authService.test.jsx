import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCurrentUser, login, logout } from './authService'
import { getToken, saveToken } from './sessionService'

const { getMock, postMock } = vi.hoisted(() => ({ getMock: vi.fn(), postMock: vi.fn() }))

vi.mock('axios', () => ({
  default: { create: () => ({ post: postMock }) },
}))

vi.mock('./api', () => ({ default: { get: getMock } }))

const INVALID_CREDENTIALS_MESSAGE = 'Email o contraseña incorrectos'
const CURRENT_USER = { id: 1, first_name: 'Ana', last_name: 'García', role: 'user' }

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    postMock.mockReset()
    getMock.mockReset()
  })

  it('sends the credentials as form data and saves the token', async () => {
    postMock.mockResolvedValue({ data: { access_token: 'abc123', token_type: 'bearer' } })

    await login(' ana@example.com ', 'Password123')

    const [path, credentials] = postMock.mock.calls[0]
    expect(path).toBe('/auth/token')
    expect(credentials.get('username')).toBe('ana@example.com')
    expect(credentials.get('password')).toBe('Password123')
    expect(getToken()).toBe('abc123')
  })

  it('throws the API message when the credentials are wrong', async () => {
    postMock.mockRejectedValue({ response: { status: 401, data: { detail: INVALID_CREDENTIALS_MESSAGE } } })

    await expect(login('ana@example.com', 'WrongPass123')).rejects.toThrow(INVALID_CREDENTIALS_MESSAGE)
    expect(getToken()).toBeNull()
  })

  it('throws a generic message when the API is not available', async () => {
    postMock.mockRejectedValue(new Error('Network Error'))

    await expect(login('ana@example.com', 'Password123')).rejects.toThrow(
      'No se ha podido iniciar sesión. Inténtelo de nuevo más tarde.',
    )
  })

  it('clears the session on logout', () => {
    saveToken('abc123')

    logout()

    expect(getToken()).toBeNull()
  })

  it('fetches the current user from /auth/me', async () => {
    getMock.mockResolvedValue({ data: CURRENT_USER })

    await expect(fetchCurrentUser()).resolves.toEqual(CURRENT_USER)
    expect(getMock).toHaveBeenCalledWith('/auth/me')
  })

  it('throws a clear message when the current user cannot be loaded', async () => {
    getMock.mockRejectedValue(new Error('Network Error'))

    await expect(fetchCurrentUser()).rejects.toThrow(
      'No se han podido cargar los datos de su sesión. Inténtelo de nuevo más tarde.',
    )
  })
})
