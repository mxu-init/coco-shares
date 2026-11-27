import { useEffect, useState, useSyncExternalStore } from 'react'
import { fetchCurrentUser } from '../services/authService'
import { getToken, subscribeToSession } from '../services/sessionService'

const NO_LOADED_SESSION = { token: null, user: null }

export const useCurrentUser = () => {
  const token = useSyncExternalStore(subscribeToSession, getToken)
  const [loadedSession, setLoadedSession] = useState(NO_LOADED_SESSION)

  useEffect(() => {
    if (!token) return

    let isLatestRequest = true
    const saveLoadedSession = (user) => {
      if (isLatestRequest) setLoadedSession({ token, user })
    }

    fetchCurrentUser()
      .then(saveLoadedSession)
      .catch(() => saveLoadedSession(null))

    return () => {
      isLatestRequest = false
    }
  }, [token])

  const isSessionLoaded = loadedSession.token === token

  return {
    currentUser: token && isSessionLoaded ? loadedSession.user : null,
    isLoadingUser: Boolean(token) && !isSessionLoaded,
  }
}
