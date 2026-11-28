export const PASSWORD_MIN_LENGTH = 12
export const PASSWORD_MAX_LENGTH = 128
const PASSWORD_CHARACTER_PATTERNS = [/[A-Z]/, /[a-z]/, /\d/, /[!@#$%&*?\-_+=]/]

export const PASSWORD_RULES_MESSAGE = `Entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres, con mayúscula, minúscula, número y un carácter especial (!@#$%&*?-_+=).`
export const WEAK_PASSWORD_MESSAGE = 'La contraseña no cumple los requisitos'
export const PASSWORDS_DO_NOT_MATCH_MESSAGE = 'Las contraseñas no coinciden'

const isStrongPassword = (password) =>
  password.length >= PASSWORD_MIN_LENGTH &&
  password.length <= PASSWORD_MAX_LENGTH &&
  PASSWORD_CHARACTER_PATTERNS.every((pattern) => pattern.test(password))

export const validateActivationForm = ({ password, passwordConfirmation }) => {
  const fieldErrors = {
    password: isStrongPassword(password) ? '' : WEAK_PASSWORD_MESSAGE,
    passwordConfirmation: password === passwordConfirmation ? '' : PASSWORDS_DO_NOT_MATCH_MESSAGE,
  }
  return Object.fromEntries(Object.entries(fieldErrors).filter(([, message]) => message))
}
