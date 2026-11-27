import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import ProtectedRoute from './ProtectedRoute'

const PROTECTED_PATH = '/management'
const PROTECTED_CONTENT = 'Página de gestión'
const LOGIN_CONTENT = 'Página de inicio de sesión'
const ACCESS_DENIED_CONTENT = 'Página de acceso denegado'
const MANAGEMENT_ROLES = ['manager', 'admin']

const buildUser = (role) => ({ first_name: 'Luis', last_name: 'Martín López', role })

const renderProtectedRoute = (currentUser) =>
  render(
    <MemoryRouter initialEntries={[PROTECTED_PATH]}>
      <Routes>
        <Route element={<ProtectedRoute currentUser={currentUser} allowedRoles={MANAGEMENT_ROLES} />}>
          <Route path={PROTECTED_PATH} element={<p>{PROTECTED_CONTENT}</p>} />
        </Route>
        <Route path="/login" element={<p>{LOGIN_CONTENT}</p>} />
        <Route path="/access-denied" element={<p>{ACCESS_DENIED_CONTENT}</p>} />
      </Routes>
    </MemoryRouter>,
  )

describe('ProtectedRoute', () => {
  afterEach(cleanup)

  it('redirects visitors without a session to the login page', () => {
    renderProtectedRoute(null)

    expect(screen.getByText(LOGIN_CONTENT)).toBeTruthy()
    expect(screen.queryByText(PROTECTED_CONTENT)).toBeNull()
  })

  it('redirects users without an allowed role to the access denied page', () => {
    renderProtectedRoute(buildUser('user'))

    expect(screen.getByText(ACCESS_DENIED_CONTENT)).toBeTruthy()
    expect(screen.queryByText(PROTECTED_CONTENT)).toBeNull()
  })

  it.each(MANAGEMENT_ROLES)('shows the page to the %s role', (role) => {
    renderProtectedRoute(buildUser(role))

    expect(screen.getByText(PROTECTED_CONTENT)).toBeTruthy()
  })
})
