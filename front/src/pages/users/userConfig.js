export const USERS_ROUTE = '/management/users'

export const ROLE_LABELS = {
  admin: 'Administrador',
  manager: 'Manager',
  user: 'Usuario',
}

export const PERSON_TYPE_LABELS = {
  individual: 'Persona física',
  legal_entity: 'Persona jurídica',
}

export const getFullName = (user) =>
  [user.first_name, user.last_name].filter(Boolean).join(' ')

export const formatDate = (isoDate) =>
  isoDate ? new Date(isoDate).toLocaleDateString('es-ES') : ''

export const formatNumber = (value) =>
  new Intl.NumberFormat('es-ES').format(Number(value))

export const formatPercentage = (value) =>
  `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 4 }).format(Number(value))} %`

export const formatCurrency = (value) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value))