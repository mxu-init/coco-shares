import api from './api'

const CONFLICT = 409
const UNPROCESSABLE_CONTENT = 422

const INVALID_DATA_ERROR = 'Los datos enviados no son válidos'
const CREATE_USER_ERROR = 'No se ha podido crear el usuario. Inténtelo de nuevo más tarde.'
const RESET_PASSWORD_ERROR = 'No se ha podido restablecer la contraseña. Inténtelo de nuevo más tarde.'

const getCreateUserErrorMessage = (error) => {
  const status = error.response?.status
  if (status === CONFLICT) return error.response.data.detail
  if (status === UNPROCESSABLE_CONTENT) return INVALID_DATA_ERROR
  return CREATE_USER_ERROR
}

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData)
    return response.data
  } catch (error) {
    throw new Error(getCreateUserErrorMessage(error), { cause: error })
  }
}

export const resetUserPassword = async (userId) => {
  try {
    const response = await api.patch(`/users/${userId}/password`)
    return response.data
  } catch {
    throw new Error(RESET_PASSWORD_ERROR)
  }
}