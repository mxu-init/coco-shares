import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from '@mui/material'
import { resetUserPassword } from '../../services/userService'

const ACTIVATION_PATH = '/activate'
const COPIED_MESSAGE = 'Enlace copiado al portapapeles.'
const COPY_ERROR = 'No se ha podido copiar el enlace. Cópielo a mano.'
const SHARE_TITLE = 'Activa tu cuenta del portal del accionista'

const buildActivationLink = (activationToken) =>
  `${window.location.origin}${ACTIVATION_PATH}?${new URLSearchParams({ token: activationToken })}`

const canShare = () => typeof navigator.share === 'function'

function ActivationLinkDialog({ createdUser, onClose }) {
  const [activationLink, setActivationLink] = useState(buildActivationLink(createdUser.activation_token))
  const [isSaved, setIsSaved] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(activationLink)
      setFeedback({ severity: 'success', message: COPIED_MESSAGE })
    } catch {
      setFeedback({ severity: 'error', message: COPY_ERROR })
    }
  }

  const shareLink = () => navigator.share({ title: SHARE_TITLE, url: activationLink }).catch(() => {})

  const resetPassword = async () => {
    try {
      const resetResult = await resetUserPassword(createdUser.id)
      setActivationLink(buildActivationLink(resetResult.activation_token))
      setIsSaved(false)
      setFeedback(null)
    } catch (error) {
      setFeedback({ severity: 'error', message: error.message })
    }
  }

  return (
    <Dialog open disableEscapeKeyDown aria-labelledby="activation-link-title">
      <DialogTitle id="activation-link-title">Usuario creado</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2 }}>
        <Typography>
          Este es el enlace de activación de {createdUser.email}. Con él elegirá su contraseña. Caduca en 48 horas,
          solo se puede usar una vez y no se volverá a mostrar: guárdelo o compártalo con el usuario antes de cerrar.
        </Typography>
        <Typography
          component="p"
          aria-label="Enlace de activación"
          sx={{ fontFamily: 'monospace', wordBreak: 'break-all', p: 2, bgcolor: 'grey.50' }}
        >
          {activationLink}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button variant="outlined" onClick={copyLink}>
            Copiar
          </Button>
          {canShare() && (
            <Button variant="outlined" onClick={shareLink}>
              Compartir
            </Button>
          )}
          <Button variant="text" onClick={resetPassword}>
            Restablecer contraseña
          </Button>
        </Box>
        {feedback && <Alert severity={feedback.severity}>{feedback.message}</Alert>}
        <FormControlLabel
          control={<Checkbox checked={isSaved} onChange={(event) => setIsSaved(event.target.checked)} />}
          label="He guardado o compartido el enlace"
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" disabled={!isSaved} onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ActivationLinkDialog
