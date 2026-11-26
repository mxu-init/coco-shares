import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined'
import EmptyState from '../../components/EmptyState/EmptyState'

function NotFound() {
  return (
    <EmptyState
      icon={SearchOffOutlined}
      title="Página no encontrada"
      description="La página que busca no existe o ha cambiado de dirección. Compruebe el enlace o vuelva al inicio."
      actionLabel="Volver al inicio"
      actionPath="/"
    />
  )
}

export default NotFound
