import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login, logout } from './authService'
import { getToken, saveToken } from './sessionService'

const { postMock } = vi.hoisted(() => ({ postMock: vi.fn() }))

vi.mock('axios', () => ({
  default: { create: () => ({ post: postMock }) },
}))

const INVALID_CREDENTIALS_MESSAGE = 'Email o contraseña incorrectos'

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    postMock.mockReset()
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
})
