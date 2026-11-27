const LOCALE = 'es-ES'

const integerFormat = new Intl.NumberFormat(LOCALE, { useGrouping: 'always' })
const decimalFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: 'always',
})

export const formatSharesCount = (value) => integerFormat.format(Number(value))

export const formatSharesPercentage = (value) => `${decimalFormat.format(Number(value))} %`

export const formatShareCapital = (value) => `${decimalFormat.format(Number(value))} €`

export const getShareholderName = ({ first_name, last_name }) =>
  [first_name, last_name].filter(Boolean).join(' ')
