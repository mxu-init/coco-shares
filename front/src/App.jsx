import './App.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { useCurrentUser } from './hooks/useCurrentUser'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import AccessDenied from './pages/accessdenied/AccessDenied'
import NotFound from './pages/notfound/NotFound'
import Shareholders from './pages/shareholders/Shareholders'
import { ALL_ROLES } from './userRoles'

function App() {
  const { currentUser, isLoadingUser } = useCurrentUser()

  return (
    <Routes>
      <Route element={<Layout user={currentUser} />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route
          element={
            <ProtectedRoute currentUser={currentUser} isLoadingUser={isLoadingUser} allowedRoles={ALL_ROLES} />
          }
        >
          <Route path="/shareholders" element={<Shareholders />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
