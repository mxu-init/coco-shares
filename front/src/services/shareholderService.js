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
