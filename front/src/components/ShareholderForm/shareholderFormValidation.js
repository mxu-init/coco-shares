const SHARES_COUNT_PATTERN = /^\d{1,18}$/
const SHARES_PERCENTAGE_PATTERN = /^\d{1,3}(\.\d{1,4})?$/
const SHARE_CAPITAL_PATTERN = /^\d{1,13}(\.\d{1,2})?$/
const MAX_SHARES_PERCENTAGE = 100
const REPRESENTATIVE_NAME_MAX_LENGTH = 200
const REPRESENTATIVE_TAX_ID_MAX_LENGTH = 20

export const INVALID_SHARES_COUNT_MESSAGE = 'Introduzca un número entero de acciones igual o mayor que 0'
export const INVALID_SHARES_PERCENTAGE_MESSAGE = 'Introduzca un porcentaje entre 0 y 100, con 4 decimales como máximo'
export const INVALID_SHARE_CAPITAL_MESSAGE = 'Introduzca un capital igual o mayor que 0, con 2 decimales como máximo'
export const INVALID_REPRESENTATIVE_NAME_MESSAGE = `El representante no puede superar los ${REPRESENTATIVE_NAME_MAX_LENGTH} caracteres`
export const INVALID_REPRESENTATIVE_TAX_ID_MESSAGE = `El NIF del representante no puede superar los ${REPRESENTATIVE_TAX_ID_MAX_LENGTH} caracteres`

export const normalizeDecimal = (value) => value.trim().replace(',', '.')

const validateSharesCount = (sharesCount) =>
  SHARES_COUNT_PATTERN.test(sharesCount.trim()) ? '' : INVALID_SHARES_COUNT_MESSAGE

const validateSharesPercentage = (sharesPercentage) => {
  const percentage = normalizeDecimal(sharesPercentage)
  const isValid = SHARES_PERCENTAGE_PATTERN.test(percentage) && Number(percentage) <= MAX_SHARES_PERCENTAGE
  return isValid ? '' : INVALID_SHARES_PERCENTAGE_MESSAGE
}

const validateShareCapital = (shareCapital) =>
  SHARE_CAPITAL_PATTERN.test(normalizeDecimal(shareCapital)) ? '' : INVALID_SHARE_CAPITAL_MESSAGE

const validateMaxLength = (value, maxLength, message) => (value.trim().length <= maxLength ? '' : message)

export const validateShareholderForm = (values) => {
  const fieldErrors = {
    shares_count: validateSharesCount(values.shares_count),
    shares_percentage: validateSharesPercentage(values.shares_percentage),
    share_capital: validateShareCapital(values.share_capital),
    representative_name: validateMaxLength(
      values.representative_name,
      REPRESENTATIVE_NAME_MAX_LENGTH,
      INVALID_REPRESENTATIVE_NAME_MESSAGE,
    ),
    representative_tax_id: validateMaxLength(
      values.representative_tax_id,
      REPRESENTATIVE_TAX_ID_MAX_LENGTH,
      INVALID_REPRESENTATIVE_TAX_ID_MESSAGE,
    ),
  }
  return Object.fromEntries(Object.entries(fieldErrors).filter(([, message]) => message))
}

const emptyToNull = (value) => value.trim() || null

export const buildShareholderPayload = (values) => ({
  shares_count: Number(values.shares_count.trim()),
  shares_percentage: normalizeDecimal(values.shares_percentage),
  share_capital: normalizeDecimal(values.share_capital),
  representative_name: emptyToNull(values.representative_name),
  representative_tax_id: emptyToNull(values.representative_tax_id),
})
