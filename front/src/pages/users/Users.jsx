import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Chip,
  Container,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { getUsers } from '../../api/usersApi'
import { ROLE_LABELS, USERS_ROUTE, getFullName } from './UsersConfig'

const SEARCH_DELAY_MS = 400
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50]
const STATUS_OPTIONS = { active: 'Activos', inactive: 'Inactivos' }
const SELECT_SLOT_PROPS = { select: { displayEmpty: true }, inputLabel: { shrink: true } }
const HIDDEN_ON_MOBILE = { display: { xs: 'none', md: 'table-cell' } }

function Users() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0])
  const [result, setResult] = useState({ params: null, data: null, failed: false })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(0)
    }, SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [search])

  const params = useMemo(
    () => ({
      page: page + 1,
      size: rowsPerPage,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(role && { role }),
      ...(status && { is_active: status === 'active' }),
    }),
    [page, rowsPerPage, debouncedSearch, role, status],
  )

  useEffect(() => {
    let ignore = false
    getUsers(params)
      .then((data) => {
        if (!ignore) setResult({ params, data, failed: false })
      })
      .catch(() => {
        if (!ignore) setResult({ params, data: null, failed: true })
      })
    return () => {
      ignore = true
    }
  }, [params])

  const isLoading = result.params !== params
  const users = result.data?.items ?? []
  const total = result.data?.total ?? 0

  const handleRoleChange = (event) => {
    setRole(event.target.value)
    setPage(0)
  }

  const handleStatusChange = (event) => {
    setStatus(event.target.value)
    setPage(0)
  }

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value))
    setPage(0)
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography variant="h1" sx={{ mb: 3 }}>
        Usuarios
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Buscar por nombre, apellidos o email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Rol"
          value={role}
          onChange={handleRoleChange}
          slotProps={SELECT_SLOT_PROPS}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Estado"
          value={status}
          onChange={handleStatusChange}
          slotProps={SELECT_SLOT_PROPS}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {result.failed && (
        <Alert severity="error" sx={{ mb: 2 }}>
          No se ha podido cargar el listado de usuarios. Inténtalo de nuevo.
        </Alert>
      )}

      <Paper variant="outlined">
        {isLoading ? <LinearProgress /> : <Box sx={{ height: 4 }} />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell sx={HIDDEN_ON_MOBILE}>Email</TableCell>
                <TableCell sx={HIDDEN_ON_MOBILE}>NIF</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={`${USERS_ROUTE}/${user.id}`} underline="hover">
                      {getFullName(user)}
                    </Link>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: { xs: 'block', md: 'none' } }}
                    >
                      {user.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={HIDDEN_ON_MOBILE}>{user.email}</TableCell>
                  <TableCell sx={HIDDEN_ON_MOBILE}>{user.tax_id}</TableCell>
                  <TableCell>{ROLE_LABELS[user.role] ?? user.role}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.is_active ? 'Activo' : 'Inactivo'}
                      color={user.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && !result.failed && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No se han encontrado usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </Paper>
    </Container>
  )
}

export default Users