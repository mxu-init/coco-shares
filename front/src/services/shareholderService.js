import api from './api'

export const SHAREHOLDERS_PAGE_SIZE = 20

const FETCH_SHAREHOLDERS_ERROR =
  'No se ha podido cargar el listado de accionistas. Inténtelo de nuevo más tarde.'

export const fetchShareholders = async (page) => {
  try {
    const response = await api.get('/shareholders', {
      params: { page, size: SHAREHOLDERS_PAGE_SIZE },
    })
    return response.data
  } catch {
    throw new Error(FETCH_SHAREHOLDERS_ERROR)
  }
}

const SAVE_SHAREHOLDER_ERROR =
  'No se ha podido guardar la ficha de accionista. Inténtelo de nuevo más tarde.'
const DELETE_SHAREHOLDER_ERROR =
  'No se ha podido eliminar la ficha de accionista. Inténtelo de nuevo más tarde.'
const INVALID_DATA_STATUS = 422
const STATUSES_WITH_API_MESSAGE = [404, 409, INVALID_DATA_STATUS]
const SHAREHOLDER_FIELD_LABELS = {
  shares_count: 'Nº de acciones',
  shares_percentage: '% de acciones',
  share_capital: 'Capital social',
  representative_name: 'Representante',
  representative_tax_id: 'NIF del representante',
}

const userShareholderPath = (userId) => `/users/${userId}/shareholder`

const buildInvalidFieldsMessage = (fieldErrors = []) => {
  const labels = fieldErrors.map((fieldError) => SHAREHOLDER_FIELD_LABELS[fieldError.loc?.at(-1)])
  const knownLabels = [...new Set(labels.filter(Boolean))]
  if (knownLabels.length === 0) return null
  return `Revise estos campos: ${knownLabels.join(', ')}.`
}

const buildShareholderErrorMessage = (error, defaultMessage) => {
  const status = error.response?.status
  const responseData = error.response?.data
  if (!STATUSES_WITH_API_MESSAGE.includes(status)) return defaultMessage
  if (status === INVALID_DATA_STATUS) {
    const invalidFieldsMessage = buildInvalidFieldsMessage(responseData?.errors)
    if (invalidFieldsMessage) return invalidFieldsMessage
  }
  if (typeof responseData?.detail === 'string') return responseData.detail
  return defaultMessage
}

export const createShareholder = async (userId, shareholderData) => {
  try {
    const response = await api.post(userShareholderPath(userId), shareholderData)
    return response.data
  } catch (error) {
    throw new Error(buildShareholderErrorMessage(error, SAVE_SHAREHOLDER_ERROR), { cause: error })
  }
}

export const updateShareholder = async (userId, changes) => {
  try {
    const response = await api.patch(userShareholderPath(userId), changes)
    return response.data
  } catch (error) {
    throw new Error(buildShareholderErrorMessage(error, SAVE_SHAREHOLDER_ERROR), { cause: error })
  }
}

export const deleteShareholder = async (userId) => {
  try {
    await api.delete(userShareholderPath(userId))
  } catch (error) {
    throw new Error(buildShareholderErrorMessage(error, DELETE_SHAREHOLDER_ERROR), { cause: error })
  }
}
