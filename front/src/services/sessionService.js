const TOKEN_KEY = 'token'

const sessionListeners = new Set()

const notifySessionChange = () => sessionListeners.forEach((listener) => listener())

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
  notifySessionChange()
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  notifySessionChange()
}

export const subscribeToSession = (listener) => {
  sessionListeners.add(listener)
  return () => sessionListeners.delete(listener)
}
