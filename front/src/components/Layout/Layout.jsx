import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../BottomNav/BottomNav'
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import { findActiveItem, getNavigationItems, getSectionItems } from './navigationItems'

function Layout({ user = null }) {
  const { pathname } = useLocation()
  const navigationItems = getNavigationItems(user?.role)
  const sectionItems = getSectionItems(user?.role)
  const activeItem = findActiveItem(navigationItems, pathname)
  const hasBottomNav = sectionItems.length > 0

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        pb: { xs: hasBottomNav ? 8 : 0, md: 0 },
      }}
    >
      <Header user={user} navigationItems={navigationItems} activeItem={activeItem} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      {hasBottomNav && <BottomNav sectionItems={sectionItems} activeItem={activeItem} />}
    </Box>
  )
}

export default Layout
