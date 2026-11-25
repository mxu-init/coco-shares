import { AppBar, Avatar, Box, Button, ButtonBase, Toolbar, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'
import { HOME_PATH } from '../Layout/navigationItems'

function DesktopHeader({ userSummary, navigationItems, activeItem, isOnLoginPage }) {
  const theme = useTheme()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: 'primary.main' }}
    >
      <Toolbar sx={{ height: 64, px: { md: 4 }, gap: 4 }}>
        <Box component={RouterLink} to={HOME_PATH} sx={{ display: 'flex', flexShrink: 0 }}>
          <Box
            component="img"
            src={theme.brand.logoCompactNegative}
            alt={theme.brand.name}
            sx={{ height: 32 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignSelf: 'stretch', flexGrow: 1 }}>
          {navigationItems.length > 0 && (
            <Box component="nav" aria-label="Navegación principal" sx={{ display: 'flex', gap: { md: 2.5, lg: 3 } }}>
              {navigationItems.map((item) => {
                const isActive = item === activeItem

                return (
                  <ButtonBase
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    sx={{
                      typography: 'subtitle2',
                      color: isActive ? 'primary.contrastText' : 'grey.100',
                      borderBottom: 3,
                      borderTop: 3,
                      borderTopColor: 'transparent',
                      borderBottomColor: isActive ? 'secondary.main' : 'transparent',
                      '&:hover': { color: 'primary.contrastText' },
                    }}
                  >
                    {item.label}
                  </ButtonBase>
                )
              })}
            </Box>
          )}
        </Box>

        {!userSummary && (
          <Button
            component={RouterLink}
            to={isOnLoginPage ? HOME_PATH : '/login'}
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            {isOnLoginPage ? 'Volver al anuncio' : 'Iniciar sesión'}
          </Button>
        )}

        {userSummary && (
          <ButtonBase
            component={RouterLink}
            to="/profile"
            aria-label="Abrir mi perfil"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, borderRadius: 1 }}
          >
            <Box sx={{ display: { xs: 'none', lg: 'grid' }, textAlign: 'right' }}>
              <Typography variant="subtitle2" component="span">
                {userSummary.fullName}
              </Typography>
              <Typography variant="caption" component="span" sx={{ color: 'grey.100' }}>
                {userSummary.roleLabel}
              </Typography>
            </Box>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primaryHover', color: 'primary.contrastText', typography: 'subtitle2' }}>
              {userSummary.initials}
            </Avatar>
          </ButtonBase>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default DesktopHeader
