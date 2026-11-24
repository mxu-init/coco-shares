import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import api from './api'
import { getToken, saveToken } from './sessionService'

const runRequestInterceptor = (config) =>
  api.interceptors.request.handlers[0].fulfilled(config)

const runResponseErrorInterceptor = (error) =>
  api.interceptors.response.handlers[0].rejected(error)

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal('location', { assign: vi.fn() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds the token to the Authorization header', () => {
    saveToken('abc123')

    const config = runRequestInterceptor({ headers: {} })

    expect(config.headers.Authorization).toBe('Bearer abc123')
  })

  it('does not add the header when there is no token', () => {
    const config = runRequestInterceptor({ headers: {} })

    expect(config.headers.Authorization).toBeUndefined()
  })

  it('clears the session and redirects to /login on 401', async () => {
    saveToken('abc123')
    const error = { response: { status: 401 } }

    await expect(runResponseErrorInterceptor(error)).rejects.toEqual(error)

    expect(getToken()).toBeNull()
    expect(window.location.assign).toHaveBeenCalledWith('/login')
  })

  it('keeps the session and redirects to /access-denied on 403', async () => {
    saveToken('abc123')
    const error = { response: { status: 403 } }

    await expect(runResponseErrorInterceptor(error)).rejects.toEqual(error)

    expect(getToken()).toBe('abc123')
    expect(window.location.assign).toHaveBeenCalledWith('/access-denied')
  })
})