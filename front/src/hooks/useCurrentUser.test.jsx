import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchCurrentUser } from '../services/authService'
import { clearSession, saveToken } from '../services/sessionService'
import { useCurrentUser } from './useCurrentUser'

vi.mock('../services/authService', () => ({ fetchCurrentUser: vi.fn() }))

const TOKEN = 'abc123'
const CURRENT_USER = { id: 1, first_name: 'Luis', last_name: 'Martín López', role: 'user' }
const NO_SESSION = { currentUser: null, isLoadingUser: false }

describe('useCurrentUser', () => {
  beforeEach(() => {
    localStorage.clear()
    fetchCurrentUser.mockReset()
  })

  afterEach(cleanup)

  it('returns no user without a session', () => {
    const { result } = renderHook(() => useCurrentUser())

    expect(result.current).toEqual(NO_SESSION)
    expect(fetchCurrentUser).not.toHaveBeenCalled()
  })

  it('loads the current user when there is a saved session', async () => {
    saveToken(TOKEN)
    fetchCurrentUser.mockResolvedValue(CURRENT_USER)

    const { result } = renderHook(() => useCurrentUser())

    expect(result.current.isLoadingUser).toBe(true)
    await waitFor(() => expect(result.current.currentUser).toEqual(CURRENT_USER))
    expect(result.current.isLoadingUser).toBe(false)
  })

  it('loads the current user right after logging in', async () => {
    fetchCurrentUser.mockResolvedValue(CURRENT_USER)
    const { result } = renderHook(() => useCurrentUser())

    act(() => saveToken(TOKEN))

    await waitFor(() => expect(result.current.currentUser).toEqual(CURRENT_USER))
  })

  it('forgets the user when the session is closed', async () => {
    saveToken(TOKEN)
    fetchCurrentUser.mockResolvedValue(CURRENT_USER)
    const { result } = renderHook(() => useCurrentUser())
    await waitFor(() => expect(result.current.currentUser).toEqual(CURRENT_USER))

    act(() => clearSession())

    expect(result.current).toEqual(NO_SESSION)
  })

  it('treats a session that cannot be loaded as no user', async () => {
    saveToken(TOKEN)
    fetchCurrentUser.mockRejectedValue(new Error('Network Error'))

    const { result } = renderHook(() => useCurrentUser())

    await waitFor(() => expect(result.current).toEqual(NO_SESSION))
  })
})
