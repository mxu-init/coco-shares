import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import ArrowBack from '@mui/icons-material/ArrowBack'
import PersonOffOutlined from '@mui/icons-material/PersonOffOutlined'
import { getUserById } from '../../api/usersApi'
import EmptyState from '../../components/EmptyState/EmptyState'
import {
  PERSON_TYPE_LABELS,
  ROLE_LABELS,
  USERS_ROUTE,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercentage,
  getFullName,
} from './usersConfig'

const NOT_FOUND_STATUSES = [404, 422]
const FIELDS_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
  gap: 2,
}

function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Box>
  )
}

function BackButton() {
  return (
    <Button component={RouterLink} to={USERS_ROUTE} startIcon={<ArrowBack />} sx={{ mb: 2 }}>
      Volver al listado
    </Button>
  )
}

function userDetail() {
  const { userId } = useParams()
  const [result, setResult] = useState({ userId: null, user: null, errorStatus: null })

  useEffect(() => {
    let ignore = false
    getUserById(userId)
      .then((user) => {
        if (!ignore) setResult({ userId, user, errorStatus: null })
      })
      .catch((error) => {
        if (!ignore) setResult({ userId, user: null, errorStatus: error.response?.status ?? 0 })
      })
    return () => {
      ignore = true
    }
  }, [userId])

  const isLoading = result.userId !== userId
  const { user, errorStatus } = result

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <LinearProgress />
      </Container>
    )
  }

  if (NOT_FOUND_STATUSES.includes(errorStatus)) {
    return (
      <EmptyState
        icon={PersonOffOutlined}
        title="Usuario no encontrado"
        description="El usuario que buscas no existe o ya no está disponible."
        actionLabel="Volver al listado"
        actionPath={USERS_ROUTE}
      />
    )
  }

  if (errorStatus !== null) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <BackButton />
        <Alert severity="error">
          No se ha podido cargar el usuario. Inténtalo de nuevo.
        </Alert>
      </Container>
    )
  }

  const { shareholder } = user

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <BackButton />

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h1" sx={{ mb: 1 }}>
              {getFullName(user)}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip size="small" label={ROLE_LABELS[user.role] ?? user.role} />
              <Chip
                size="small"
                label={user.is_active ? 'Activo' : 'Inactivo'}
                color={user.is_active ? 'success' : 'default'}
              />
            </Stack>
          </Box>

          <Box sx={FIELDS_GRID_SX}>
            <Field label="Email" value={user.email} />
            <Field label="Teléfono" value={user.phone} />
            <Field label="NIF" value={user.tax_id} />
            <Field label="Tipo de persona" value={PERSON_TYPE_LABELS[user.person_type]} />
            <Field label="Dirección" value={user.address} />
            <Field label="Alta" value={formatDate(user.created_at)} />
            <Field label="Última actualización" value={formatDate(user.updated_at)} />
          </Box>

          <Divider />

          <Box>
            <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
              Ficha de accionista
            </Typography>
            {shareholder ? (
              <Box sx={FIELDS_GRID_SX}>
                <Field label="Acciones" value={formatNumber(shareholder.shares_count)} />
                <Field
                  label="Porcentaje de capital"
                  value={formatPercentage(shareholder.shares_percentage)}
                />
                <Field label="Capital social" value={formatCurrency(shareholder.share_capital)} />
                <Field label="Representante" value={shareholder.representative_name} />
                <Field label="NIF del representante" value={shareholder.representative_tax_id} />
              </Box>
            ) : (
              <Typography color="text.secondary">
                Este usuario no tiene ficha de accionista.
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    </Container>
  )
}

export default userDetail
