import axios from 'axios'
import { clearSession, getToken } from './sessionService'

const UNAUTHORIZED = 401
const FORBIDDEN = 403

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

const addAuthorizationHeader = (config) => {
  const token = getToken()
  if (!token) return config
  config.headers.Authorization = `Bearer ${token}`
  return config
}

const handleResponseError = (error) => {
  const status = error.response?.status
  if (status === UNAUTHORIZED) {
    clearSession()
    window.location.assign('/login')
  }
  if (status === FORBIDDEN) {
    window.location.assign('/access-denied')
  }
  return Promise.reject(error)
}

api.interceptors.request.use(addAuthorizationHeader)
api.interceptors.response.use((response) => response, handleResponseError)

export default api