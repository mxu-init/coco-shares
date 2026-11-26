import { useLocation } from 'react-router-dom'
import DesktopHeader from '../DesktopHeader/DesktopHeader'
import MobileHeader from '../MobileHeader/MobileHeader'
import { getFullName, getInitials, getRoleLabel } from './userDetails'

const VISITOR_TITLE = 'Portal del accionista'
const LOGIN_PATH = '/login'

function Header({ user, navigationItems, activeItem }) {
  const { pathname } = useLocation()
  const isOnLoginPage = pathname === LOGIN_PATH

  const userSummary = user && {
    fullName: getFullName(user),
    initials: getInitials(user),
    roleLabel: getRoleLabel(user.role),
  }

  return (
    <>
      <MobileHeader
        title={activeItem?.label ?? VISITOR_TITLE}
        userSummary={userSummary}
        activeItem={activeItem}
        isOnLoginPage={isOnLoginPage}
      />
      <DesktopHeader
        userSummary={userSummary}
        navigationItems={navigationItems}
        activeItem={activeItem}
        isOnLoginPage={isOnLoginPage}
      />
    </>
  )
}

export default Header
