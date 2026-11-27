import { Alert, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { activateAccount } from '../../services/activationService'
import { PASSWORD_RULES_MESSAGE, validateActivationForm } from './activationFormValidation'

const LOGIN_PATH = '/login'
const MISSING_TOKEN_MESSAGE = 'El enlace de activación no es válido. Pida uno nuevo al administrador.'
const EMPTY_FORM = { password: '', passwordConfirmation: '' }

function Activate() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isActivated, setIsActivated] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateActivationForm(formValues)
    setFieldErrors(validationErrors)
    setSubmitError('')
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await activateAccount(token, formValues.password)
      setFormValues(EMPTY_FORM)
      setIsActivated(true)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
        <Alert severity="error">{MISSING_TOKEN_MESSAGE}</Alert>
      </Container>
    )
  }

  if (isActivated) {
    return (
      <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={3}>
          <Alert severity="success">Su cuenta está activada. Ya puede iniciar sesión con su nueva contraseña.</Alert>
          <Button component={RouterLink} to={LOGIN_PATH} variant="contained" sx={{ minHeight: 48 }}>
            Ir a iniciar sesión
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography variant="overline" component="p" sx={{ color: 'accentText' }}>
        Portal del accionista
      </Typography>
      <Typography variant="h1" sx={{ mb: 3 }}>
        Activar cuenta
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
            id="activation-password"
            name="password"
            type="password"
            label="Nueva contraseña"
            autoComplete="new-password"
            value={formValues.password}
            onChange={handleChange}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password || PASSWORD_RULES_MESSAGE}
            fullWidth
          />
          <TextField
            id="activation-password-confirmation"
            name="passwordConfirmation"
            type="password"
            label="Repita la contraseña"
            autoComplete="new-password"
            value={formValues.passwordConfirmation}
            onChange={handleChange}
            error={Boolean(fieldErrors.passwordConfirmation)}
            helperText={fieldErrors.passwordConfirmation}
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth sx={{ minHeight: 48 }}>
            {isSubmitting ? 'Activando…' : 'Activar cuenta'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}

export default Activate
