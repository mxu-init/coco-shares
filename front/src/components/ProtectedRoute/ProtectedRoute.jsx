import { Navigate, Outlet } from 'react-router-dom'

const LOGIN_PATH = '/login'
const ACCESS_DENIED_PATH = '/access-denied'

function ProtectedRoute({ currentUser, allowedRoles }) {
  if (!currentUser) return <Navigate to={LOGIN_PATH} replace />
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to={ACCESS_DENIED_PATH} replace />
  return <Outlet />
}

export default ProtectedRoute
