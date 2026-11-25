import { cleanup, render, screen, within } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import theme from '../../theme'
import Layout from './Layout'

const PAGE_CONTENT = 'Contenido de la página'
const SHAREHOLDER_SECTIONS = ['Juntas', 'Accionariado', 'Consejo', 'Auditorías']
const NAVIGATION_NAME = 'Navegación principal'

const buildUser = (role) => ({ first_name: 'Luis', last_name: 'Martín López', role })

const renderLayout = ({ user = null, path = '/' } = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Layout user={user} />}>
            <Route path="*" element={<p>{PAGE_CONTENT}</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )

const getHeaders = () => {
  const [mobileHeader, desktopHeader] = screen.getAllByRole('banner', { hidden: true })
  return { mobileHeader: within(mobileHeader), desktopHeader: within(desktopHeader) }
}

const getLinkLabels = (navigation) =>
  within(navigation)
    .getAllByRole('link', { hidden: true })
    .map((link) => link.textContent)

const getBottomNavigationLabels = () => {
  const bottomNavigation = screen
    .getAllByRole('navigation', { hidden: true })
    .find((navigation) => !navigation.closest('header'))
  return getLinkLabels(bottomNavigation)
}

const getDesktopNavigationLabels = () =>
  getLinkLabels(getHeaders().desktopHeader.getByRole('navigation', { name: NAVIGATION_NAME, hidden: true }))

describe('Layout', () => {
  afterEach(cleanup)

  it('renders the page content and the footer', () => {
    renderLayout()

    expect(screen.getByText(PAGE_CONTENT)).toBeTruthy()
    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  it('shows the login button and no navigation to visitors', () => {
    renderLayout()
    const { mobileHeader, desktopHeader } = getHeaders()

    expect(mobileHeader.getByRole('link', { name: 'Iniciar sesión', hidden: true })).toBeTruthy()
    expect(desktopHeader.getByRole('link', { name: 'Iniciar sesión', hidden: true })).toBeTruthy()
    expect(screen.queryAllByRole('navigation', { hidden: true })).toHaveLength(0)
    expect(screen.queryAllByRole('link', { name: 'Abrir mi perfil', hidden: true })).toHaveLength(0)
  })

  it('shows a back link to visitors on the login page', () => {
    renderLayout({ path: '/login' })
    const { mobileHeader, desktopHeader } = getHeaders()

    expect(mobileHeader.getByRole('link', { name: 'Volver', hidden: true }).getAttribute('href')).toBe('/')
    expect(desktopHeader.getByRole('link', { name: 'Volver al anuncio', hidden: true }).getAttribute('href')).toBe('/')
  })

  it('shows the shareholder sections to users', () => {
    renderLayout({ user: buildUser('user') })

    expect(getBottomNavigationLabels()).toEqual(SHAREHOLDER_SECTIONS)
    expect(getDesktopNavigationLabels()).toEqual(['Inicio', ...SHAREHOLDER_SECTIONS])
    expect(screen.queryAllByRole('link', { name: 'Iniciar sesión', hidden: true })).toHaveLength(0)
  })

  it.each(['manager', 'admin'])('adds the management section for %s', (role) => {
    renderLayout({ user: buildUser(role) })

    expect(getBottomNavigationLabels()).toEqual([...SHAREHOLDER_SECTIONS, 'Gestión'])
    expect(getDesktopNavigationLabels()).toEqual(['Inicio', ...SHAREHOLDER_SECTIONS, 'Gestión'])
  })

  it('shows the user initials linked to the profile in both headers', () => {
    renderLayout({ user: buildUser('user') })
    const { mobileHeader, desktopHeader } = getHeaders()

    ;[mobileHeader, desktopHeader].forEach((header) => {
      const profileLink = header.getByRole('link', { name: 'Abrir mi perfil', hidden: true })
      expect(profileLink.getAttribute('href')).toBe('/profile')
      expect(within(profileLink).getByText('LM')).toBeTruthy()
    })
  })

  it('shows the full name and role label in the desktop header', () => {
    renderLayout({ user: buildUser('admin') })
    const { desktopHeader } = getHeaders()

    expect(desktopHeader.getByText('Luis Martín López')).toBeTruthy()
    expect(desktopHeader.getByText('Administrador')).toBeTruthy()
  })

  it('marks the current section as active', () => {
    renderLayout({ user: buildUser('user'), path: '/meetings/3' })
    const { mobileHeader } = getHeaders()

    expect(screen.getAllByRole('link', { name: 'Juntas', current: 'page', hidden: true })).toHaveLength(2)
    expect(mobileHeader.getByRole('link', { name: 'Ir a Inicio', hidden: true }).getAttribute('aria-current')).toBeNull()
  })

  it('marks the home button as active on the home page', () => {
    renderLayout({ user: buildUser('user') })
    const { mobileHeader } = getHeaders()

    expect(mobileHeader.getByRole('link', { name: 'Ir a Inicio', current: 'page', hidden: true })).toBeTruthy()
  })
})
