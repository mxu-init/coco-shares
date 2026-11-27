import axios from 'axios'
import { clearSession, saveToken } from './sessionService'

const LOGIN_PATH = '/auth/token'
const INVALID_CREDENTIALS_STATUS = 401
const LOGIN_ERROR_MESSAGE = 'No se ha podido iniciar sesión. Inténtelo de nuevo más tarde.'

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

const buildLoginErrorMessage = (error) => {
  if (error.response?.status === INVALID_CREDENTIALS_STATUS) return error.response.data.detail
  return LOGIN_ERROR_MESSAGE
}

export const login = async (email, password) => {
  try {
    const credentials = new URLSearchParams({ username: email.trim(), password })
    const response = await authApi.post(LOGIN_PATH, credentials)
    saveToken(response.data.access_token)
    return response.data
  } catch (error) {
    throw new Error(buildLoginErrorMessage(error), { cause: error })
  }
}

export const logout = () => clearSession()
