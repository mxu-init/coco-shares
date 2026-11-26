import HomeOutlined from '@mui/icons-material/HomeOutlined'
import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'
import { HOME_PATH } from '../Layout/navigationItems'

function MobileHeader({ title, userSummary, activeItem, isOnLoginPage }) {
  const theme = useTheme()
  const isHomeActive = activeItem?.path === HOME_PATH

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        display: { md: 'none' },
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1.5, pl: 2, pr: 1 }}>
        <Box component={RouterLink} to={HOME_PATH} sx={{ display: 'flex', flexShrink: 0 }}>
          <Box component="img" src={theme.brand.isotype} alt={theme.brand.name} sx={{ height: 32 }} />
        </Box>

        <Typography variant="subtitle1" component="p" noWrap sx={{ flexGrow: 1, minWidth: 0, color: 'primary.main' }}>
          {title}
        </Typography>

        {!userSummary && (
          <Button
            component={RouterLink}
            to={isOnLoginPage ? HOME_PATH : '/login'}
            size="small"
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {isOnLoginPage ? 'Volver' : 'Iniciar sesión'}
          </Button>
        )}

        {userSummary && (
          <>
            <IconButton
              component={RouterLink}
              to={HOME_PATH}
              aria-label="Ir a Inicio"
              aria-current={isHomeActive ? 'page' : undefined}
              sx={{
                width: 48,
                height: 48,
                color: isHomeActive ? 'primary.main' : 'grey.500',
                bgcolor: isHomeActive ? 'primary.light' : 'transparent',
              }}
            >
              <HomeOutlined />
            </IconButton>
            <IconButton component={RouterLink} to="/profile" aria-label="Abrir mi perfil" sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.main', typography: 'subtitle2' }}>
                {userSummary.initials}
              </Avatar>
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default MobileHeader
