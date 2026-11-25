import './App.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/home/Home'
import Login from './pages/login/Login'
import AccessDenied from './pages/accessdenied/AccessDenied'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Route>
    </Routes>
  )
}

export default App
