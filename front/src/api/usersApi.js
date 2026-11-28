import api from '../services/api'

// Si VITE_API_URL ya incluye /api/v1, déjalo así.
// Si solo apunta al servidor (http://localhost:8000), usa '/api/v1/users'.
const USERS_PATH = '/users'

export const getUsers = async (params) => {
  const { data } = await api.get(USERS_PATH, { params })
  return data
}

export const getUserById = async (userId) => {
  const { data } = await api.get(`${USERS_PATH}/${userId}`)
  return data
}