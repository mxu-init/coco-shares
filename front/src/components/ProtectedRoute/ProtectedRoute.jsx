import { Box, CircularProgress } from '@mui/material'
import { Navigate, Outlet } from 'react-router-dom'

const LOGIN_PATH = '/login'
const ACCESS_DENIED_PATH = '/access-denied'
const LOADING_LABEL = 'Comprobando su sesión'

function ProtectedRoute({ currentUser, isLoadingUser, allowedRoles }) {
  if (isLoadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress aria-label={LOADING_LABEL} />
      </Box>
    )
  }

  if (!currentUser) return <Navigate to={LOGIN_PATH} replace />
  if (!allowedRoles.includes(currentUser.role)) return <Navigate to={ACCESS_DENIED_PATH} replace />
  return <Outlet />
}

export default ProtectedRoute
