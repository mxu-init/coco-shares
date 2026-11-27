import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import ActivationLinkDialog from '../../components/ActivationLinkDialog/ActivationLinkDialog'
import { createUser } from '../../services/userService'

const INDIVIDUAL = 'individual'
const LEGAL_ENTITY = 'legal_entity'

const ROLE_OPTIONS = [
  { value: 'user', label: 'Accionista' },
  { value: 'manager', label: 'Manager' },
  { value: 'admin', label: 'Administrador' },
]

const EMPTY_FORM = {
  role: 'user',
  person_type: INDIVIDUAL,
  first_name: '',
  last_name: '',
  tax_id: '',
  email: '',
  phone: '',
  address: '',
  has_shareholder: false,
  shares_count: '',
  shares_percentage: '',
  share_capital: '',
  representative_name: '',
  representative_tax_id: '',
}

const valueOrNull = (value) => value.trim() || null

const buildShareholder = (form) => ({
  shares_count: Number(form.shares_count),
  shares_percentage: form.shares_percentage,
  share_capital: form.share_capital,
  representative_name: valueOrNull(form.representative_name),
  representative_tax_id: valueOrNull(form.representative_tax_id),
})

const buildUserData = (form) => ({
  role: form.role,
  person_type: form.person_type,
  first_name: form.first_name.trim(),
  last_name: form.person_type === INDIVIDUAL ? form.last_name.trim() : null,
  tax_id: form.tax_id.trim(),
  email: form.email.trim(),
  phone: valueOrNull(form.phone),
  address: valueOrNull(form.address),
  shareholder: form.has_shareholder ? buildShareholder(form) : null,
})

function ShareholderFields({ form, onChange }) {
  return (
    <Box component="fieldset" sx={{ border: 0, p: 0, m: 0, display: 'grid', gap: 2 }}>
      <Typography component="legend" variant="h3" sx={{ mb: 2 }}>
        Ficha de accionista
      </Typography>
      <TextField label="Nº de acciones" name="shares_count" type="number" required value={form.shares_count} onChange={onChange} slotProps={{ htmlInput: { min: 0, step: 1 } }} />
      <TextField label="% de acciones" name="shares_percentage" type="number" required value={form.shares_percentage} onChange={onChange} slotProps={{ htmlInput: { min: 0, max: 100, step: 0.0001 } }} />
      <TextField label="Capital social (€)" name="share_capital" type="number" required value={form.share_capital} onChange={onChange} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
      <TextField label="Representante (opcional)" name="representative_name" value={form.representative_name} onChange={onChange} />
      <TextField label="NIF del representante (opcional)" name="representative_tax_id" value={form.representative_tax_id} onChange={onChange} />
    </Box>
  )
}

function NewUser() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdUser, setCreatedUser] = useState(null)

  const isIndividual = form.person_type === INDIVIDUAL

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: type === 'checkbox' ? checked : value }))
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      setCreatedUser(await createUser(buildUserData(form)))
      setForm(EMPTY_FORM)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: { xs: 3, md: 4 } }}>
        Nuevo usuario
      </Typography>
      <Box component="form" onSubmit={submitForm} sx={{ display: 'grid', gap: 2 }}>
        <TextField select label="Rol" name="role" required value={form.role} onChange={updateField}>
          {ROLE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <FormControl>
          <FormLabel id="person-type-label">Tipo de persona</FormLabel>
          <RadioGroup row aria-labelledby="person-type-label" name="person_type" value={form.person_type} onChange={updateField}>
            <FormControlLabel value={INDIVIDUAL} control={<Radio />} label="Persona física" />
            <FormControlLabel value={LEGAL_ENTITY} control={<Radio />} label="Persona jurídica" />
          </RadioGroup>
        </FormControl>
        <TextField label={isIndividual ? 'Nombre' : 'Razón social'} name="first_name" required value={form.first_name} onChange={updateField} />
        {isIndividual && <TextField label="Apellidos" name="last_name" required value={form.last_name} onChange={updateField} />}
        <TextField label="NIF" name="tax_id" required value={form.tax_id} onChange={updateField} />
        <TextField label="Correo electrónico" name="email" type="email" required value={form.email} onChange={updateField} />
        <TextField label="Teléfono" name="phone" type="tel" required={form.has_shareholder} value={form.phone} onChange={updateField} />
        <TextField label="Dirección" name="address" required={form.has_shareholder} value={form.address} onChange={updateField} />
        <FormControlLabel
          control={<Checkbox name="has_shareholder" checked={form.has_shareholder} onChange={updateField} />}
          label="Tiene ficha de accionista"
        />
        {form.has_shareholder && <ShareholderFields form={form} onChange={updateField} />}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Crear usuario
        </Button>
      </Box>
      {createdUser && <ActivationLinkDialog createdUser={createdUser} onClose={() => setCreatedUser(null)} />}
    </Container>
  )
}

export default NewUser