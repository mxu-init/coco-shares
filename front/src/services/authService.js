import axios from 'axios'
import api from './api'
import { clearSession, saveToken } from './sessionService'

const LOGIN_PATH = '/auth/token'
const CURRENT_USER_PATH = '/auth/me'
const INVALID_CREDENTIALS_STATUS = 401
const LOGIN_ERROR_MESSAGE = 'No se ha podido iniciar sesión. Inténtelo de nuevo más tarde.'
const CURRENT_USER_ERROR_MESSAGE = 'No se han podido cargar los datos de su sesión. Inténtelo de nuevo más tarde.'

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

export const fetchCurrentUser = async () => {
  try {
    const response = await api.get(CURRENT_USER_PATH)
    return response.data
  } catch (error) {
    throw new Error(CURRENT_USER_ERROR_MESSAGE, { cause: error })
  }
}
