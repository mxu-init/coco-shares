import './App.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import AccessDenied from './pages/accessdenied/AccessDenied'
import NotFound from './pages/notfound/NotFound'
import Shareholders from './pages/shareholders/Shareholders'
import Users from './pages/users/Users'
import UserDetail from './pages/users/UserDetail'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/management/users" element={<Users />} />
        <Route path="/management/users/:userId" element={<UserDetail />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/shareholders" element={<Shareholders />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
