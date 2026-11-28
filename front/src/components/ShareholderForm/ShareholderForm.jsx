import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { createShareholder, deleteShareholder, updateShareholder } from '../../services/shareholderService'
import { buildShareholderPayload, validateShareholderForm } from './shareholderFormValidation'

const EMPTY_FORM = {
  shares_count: '',
  shares_percentage: '',
  share_capital: '',
  representative_name: '',
  representative_tax_id: '',
}

const SHAREHOLDER_FIELDS = [
  { name: 'shares_count', label: 'Nº de acciones', inputMode: 'numeric' },
  { name: 'shares_percentage', label: '% de acciones', inputMode: 'decimal' },
  { name: 'share_capital', label: 'Capital social (€)', inputMode: 'decimal' },
  { name: 'representative_name', label: 'Representante (opcional)' },
  { name: 'representative_tax_id', label: 'NIF del representante (opcional)' },
]

const toDecimalText = (value) => String(value).replace('.', ',')

const toFormValues = (shareholder) => ({
  shares_count: String(shareholder.shares_count),
  shares_percentage: toDecimalText(shareholder.shares_percentage),
  share_capital: toDecimalText(shareholder.share_capital),
  representative_name: shareholder.representative_name ?? '',
  representative_tax_id: shareholder.representative_tax_id ?? '',
})

const pickChangedFields = (payload, originalPayload) =>
  Object.fromEntries(Object.entries(payload).filter(([field, value]) => value !== originalPayload[field]))

function DeleteShareholderDialog({ isOpen, isDeleting, onCancel, onConfirm }) {
  return (
    <Dialog open={isOpen} onClose={onCancel} aria-labelledby="delete-shareholder-title">
      <DialogTitle id="delete-shareholder-title">¿Eliminar la ficha de accionista?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Se borrarán los datos de accionariado de este usuario. Esta acción no se puede deshacer.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={isDeleting}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Eliminando…' : 'Eliminar ficha'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function ShareholderForm({ userId, shareholder, onShareholderChange }) {
  const [isFormOpen, setIsFormOpen] = useState(Boolean(shareholder))
  const [formValues, setFormValues] = useState(shareholder ? toFormValues(shareholder) : EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  const saveShareholder = (payload) => {
    if (!shareholder) return createShareholder(userId, payload)
    const changes = pickChangedFields(payload, buildShareholderPayload(toFormValues(shareholder)))
    return updateShareholder(userId, changes)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateShareholderForm(formValues)
    setFieldErrors(validationErrors)
    setSubmitError('')
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const savedShareholder = await saveShareholder(buildShareholderPayload(formValues))
      setFormValues(toFormValues(savedShareholder))
      onShareholderChange(savedShareholder)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await deleteShareholder(userId)
      setFormValues(EMPTY_FORM)
      setIsFormOpen(false)
      onShareholderChange(null)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <Card component="section" variant="outlined" sx={{ p: 3 }} aria-labelledby="shareholder-form-title">
      <Typography id="shareholder-form-title" variant="h2" sx={{ mb: 2 }}>
        Ficha de accionista
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      {!isFormOpen && (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Typography variant="body1" color="text.secondary">
            Este usuario no tiene ficha de accionista.
          </Typography>
          <Button variant="contained" onClick={() => setIsFormOpen(true)}>
            Añadir ficha
          </Button>
        </Stack>
      )}

      {isFormOpen && (
        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {SHAREHOLDER_FIELDS.map(({ name, label, inputMode }) => (
              <TextField
                key={name}
                id={`shareholder-${name}`}
                name={name}
                label={label}
                value={formValues[name]}
                onChange={handleChange}
                error={Boolean(fieldErrors[name])}
                helperText={fieldErrors[name]}
                slotProps={{ htmlInput: { inputMode } }}
                fullWidth
              />
            ))}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ minHeight: 48 }}>
                {shareholder ? 'Guardar cambios' : 'Crear ficha'}
              </Button>
              {shareholder && (
                <Button
                  color="error"
                  variant="outlined"
                  disabled={isSubmitting}
                  onClick={() => setIsDeleteDialogOpen(true)}
                  sx={{ minHeight: 48 }}
                >
                  Eliminar ficha
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      )}

      <DeleteShareholderDialog
        isOpen={isDeleteDialogOpen}
        isDeleting={isSubmitting}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </Card>
  )
}

export default ShareholderForm
