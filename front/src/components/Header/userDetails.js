const ROLE_LABELS = {
  user: 'Accionista',
  manager: 'Manager',
  admin: 'Administrador',
}

export const getFullName = (user) => [user.first_name, user.last_name].filter(Boolean).join(' ')

export const getInitials = (user) =>
  [user.first_name, user.last_name]
    .filter(Boolean)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join('')

export const getRoleLabel = (role) => ROLE_LABELS[role] ?? ''
