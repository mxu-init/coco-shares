import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings'
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined'
import Badge from '@mui/icons-material/Badge'
import BadgeOutlined from '@mui/icons-material/BadgeOutlined'
import Event from '@mui/icons-material/Event'
import EventOutlined from '@mui/icons-material/EventOutlined'
import FactCheck from '@mui/icons-material/FactCheck'
import FactCheckOutlined from '@mui/icons-material/FactCheckOutlined'
import Groups from '@mui/icons-material/Groups'
import GroupsOutlined from '@mui/icons-material/GroupsOutlined'

export const HOME_PATH = '/'

const VALID_ROLES = ['user', 'manager', 'admin']
const MANAGEMENT_ROLES = ['manager', 'admin']

const homeItem = { label: 'Inicio', path: HOME_PATH }

const sectionItems = [
  { label: 'Juntas', path: '/meetings', icon: EventOutlined, activeIcon: Event },
  { label: 'Accionariado', path: '/shareholders', icon: GroupsOutlined, activeIcon: Groups },
  { label: 'Consejo', path: '/board', icon: BadgeOutlined, activeIcon: Badge },
  { label: 'Auditorías', path: '/audits', icon: FactCheckOutlined, activeIcon: FactCheck },
]

const managementItem = {
  label: 'Gestión',
  path: '/management',
  icon: AdminPanelSettingsOutlined,
  activeIcon: AdminPanelSettings,
}

export const getSectionItems = (role) => {
  if (MANAGEMENT_ROLES.includes(role)) return [...sectionItems, managementItem]
  if (VALID_ROLES.includes(role)) return sectionItems
  return []
}

export const getNavigationItems = (role) => {
  const roleSectionItems = getSectionItems(role)
  if (roleSectionItems.length === 0) return []
  return [homeItem, ...roleSectionItems]
}

export const isPathActive = (itemPath, currentPath) => {
  if (itemPath === HOME_PATH) return currentPath === HOME_PATH
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

export const findActiveItem = (navigationItems, currentPath) =>
  navigationItems.find((item) => isPathActive(item.path, currentPath)) ?? null
