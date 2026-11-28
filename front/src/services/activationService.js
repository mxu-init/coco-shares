import api from './api'

const ACTIVATION_PATH = '/auth/activate'
const UNPROCESSABLE_CONTENT = 422
const INVALID_ACTIVATION_ERROR =
  'No se ha podido activar la cuenta. El enlace puede haber caducado o ya se ha usado. Pida uno nuevo al administrador.'
const ACTIVATION_ERROR = 'No se ha podido activar la cuenta. Inténtelo de nuevo más tarde.'

const getActivationErrorMessage = (error) =>
  error.response?.status === UNPROCESSABLE_CONTENT ? INVALID_ACTIVATION_ERROR : ACTIVATION_ERROR

export const activateAccount = async (token, newPassword) => {
  try {
    const response = await api.post(ACTIVATION_PATH, { token, new_password: newPassword })
    return response.data
  } catch (error) {
    throw new Error(getActivationErrorMessage(error), { cause: error })
  }
}
