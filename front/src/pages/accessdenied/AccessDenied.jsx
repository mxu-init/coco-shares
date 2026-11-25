import { Button, Container, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

function AccessDenied() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h1" gutterBottom>Acceso denegado</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        No tiene permiso para ver esta página.
      </Typography>
      <Button component={Link} to="/" variant="contained">Volver al inicio</Button>
    </Container>
  )
}

export default AccessDenied