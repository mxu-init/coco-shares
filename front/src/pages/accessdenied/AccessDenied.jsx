import LockOutlined from '@mui/icons-material/LockOutlined'
import EmptyState from '../../components/EmptyState/EmptyState'

function AccessDenied() {
  return (
    <EmptyState
      icon={LockOutlined}
      title="Acceso denegado"
      description="No tiene permiso para ver esta página. Si cree que se trata de un error, póngase en contacto con la sociedad."
      actionLabel="Volver al inicio"
      actionPath="/"
    />
  )
}

export default AccessDenied
