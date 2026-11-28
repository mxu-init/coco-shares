import api from '../services/api'

const USERS_PATH = '/users'

export const getUsers = async (params) => {
  const { data } = await api.get(USERS_PATH, { params })
  return data
}

export const getUserById = async (userId) => {
  const { data } = await api.get(`${USERS_PATH}/${userId}`)
  return data
}