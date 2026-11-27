import { Alert, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/authService'
import { validateLoginForm } from './loginFormValidation'

const PRIVATE_HOME_PATH = '/'
const EMPTY_FORM = { email: '', password: '' }

function Login() {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateLoginForm(formValues)
    setFieldErrors(validationErrors)
    setSubmitError('')
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await login(formValues.email, formValues.password)
      navigate(PRIVATE_HOME_PATH)
    } catch (error) {
      setSubmitError(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="overline" component="p" sx={{ color: 'accentText' }}>
        Portal del accionista
      </Typography>
      <Typography variant="h1" sx={{ mb: 3 }}>
        Iniciar sesión
      </Typography>

      <Paper
        component="form"
        variant="outlined"
        noValidate
        onSubmit={handleSubmit}
        sx={{ p: { xs: 3, md: 4 }, borderRadius: 1.5 }}
      >
        <Stack spacing={2.5}>
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <TextField
            id="login-email"
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="nombre@empresa.com"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            fullWidth
          />
          <TextField
            id="login-password"
            name="password"
            type="password"
            label="Contraseña"
            placeholder="Su contraseña"
            autoComplete="current-password"
            value={formValues.password}
            onChange={handleChange}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth sx={{ minHeight: 48 }}>
            {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default Login
