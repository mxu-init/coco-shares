const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const REQUIRED_EMAIL_MESSAGE = 'Introduzca su correo electrónico'
export const INVALID_EMAIL_MESSAGE = 'Introduzca un correo electrónico válido'
export const REQUIRED_PASSWORD_MESSAGE = 'Introduzca su contraseña'

const validateEmail = (email) => {
  const trimmedEmail = email.trim()
  if (!trimmedEmail) return REQUIRED_EMAIL_MESSAGE
  if (!EMAIL_PATTERN.test(trimmedEmail)) return INVALID_EMAIL_MESSAGE
  return ''
}

const validatePassword = (password) => (password ? '' : REQUIRED_PASSWORD_MESSAGE)

export const validateLoginForm = ({ email, password }) => {
  const fieldErrors = { email: validateEmail(email), password: validatePassword(password) }
  return Object.fromEntries(Object.entries(fieldErrors).filter(([, message]) => message))
}
