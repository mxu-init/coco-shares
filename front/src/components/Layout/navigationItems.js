import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings'
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined'
import Business from '@mui/icons-material/Business'
import BusinessOutlined from '@mui/icons-material/BusinessOutlined'
import Event from '@mui/icons-material/Event'
import EventOutlined from '@mui/icons-material/EventOutlined'
import Home from '@mui/icons-material/Home'
import HomeOutlined from '@mui/icons-material/HomeOutlined'
import Person from '@mui/icons-material/Person'
import PersonOutlined from '@mui/icons-material/PersonOutlined'

const SHAREHOLDER_ROLE = 'user'
const MANAGEMENT_ROLES = ['manager', 'admin']

const commonItems = [
  { label: 'Inicio', path: '/', icon: HomeOutlined, activeIcon: Home },
  { label: 'Juntas', path: '/meetings', icon: EventOutlined, activeIcon: Event },
  { label: 'Sociedad', path: '/company', icon: BusinessOutlined, activeIcon: Business },
]

const profileItem = { label: 'Perfil', path: '/profile', icon: PersonOutlined, activeIcon: Person }

const managementItem = {
  label: 'Gestión',
  path: '/management',
  icon: AdminPanelSettingsOutlined,
  activeIcon: AdminPanelSettings,
}

export const getNavigationItems = (role) => {
  if (role === SHAREHOLDER_ROLE) return [...commonItems, profileItem]
  if (MANAGEMENT_ROLES.includes(role)) return [...commonItems, managementItem]
  return []
}

const isPathActive = (itemPath, currentPath) => {
  if (itemPath === '/') return currentPath === '/'
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

export const findActiveItem = (navigationItems, currentPath) =>
  navigationItems.find((item) => isPathActive(item.path, currentPath)) ?? null
