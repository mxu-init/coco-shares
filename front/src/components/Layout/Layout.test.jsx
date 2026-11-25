import { cleanup, render, screen, within } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import theme from '../../theme'
import Layout from './Layout'

const PAGE_CONTENT = 'Contenido de la página'

const renderLayout = ({ role = null, path = '/' } = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Layout role={role} />}>
            <Route path="*" element={<p>{PAGE_CONTENT}</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )

const getNavigationLabels = () =>
  within(screen.getByRole('navigation', { name: 'Navegación principal' }))
    .getAllByRole('link')
    .map((link) => link.textContent)

describe('Layout', () => {
  afterEach(cleanup)

  it('renders the page content and the footer', () => {
    renderLayout()

    expect(screen.getByText(PAGE_CONTENT)).toBeTruthy()
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  it('shows the login button and no navigation to visitors', () => {
    renderLayout()

    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).toBeNull()
  })

  it('shows the shareholder navigation to users', () => {
    renderLayout({ role: 'user' })

    expect(getNavigationLabels()).toEqual(['Inicio', 'Juntas', 'Sociedad', 'Perfil'])
    expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).toBeNull()
  })

  it.each(['manager', 'admin'])('shows the management navigation to %s', (role) => {
    renderLayout({ role })

    expect(getNavigationLabels()).toEqual(['Inicio', 'Juntas', 'Sociedad', 'Gestión'])
    expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).toBeNull()
  })

  it('marks the current section as active', () => {
    renderLayout({ role: 'user', path: '/meetings/3' })

    expect(screen.getByRole('link', { name: 'Juntas', current: 'page', hidden: true })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Inicio', current: 'page', hidden: true })).toBeNull()
  })
})
