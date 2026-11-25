import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'

const PUBLIC_SECTION_TITLE = 'Portal del accionista'

function Header({ navigationItems, activeItem }) {
  const theme = useTheme()
  const isVisitor = navigationItems.length === 0

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: { xs: 'background.paper', md: 'primary.main' },
        color: { xs: 'primary.main', md: 'primary.contrastText' },
        borderBottom: { xs: 1, md: 0 },
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Box
              component="img"
              src={theme.brand.isotype}
              alt={theme.brand.name}
              sx={{ height: 32, display: { xs: 'block', md: 'none' } }}
            />
            <Box
              component="img"
              src={theme.brand.logoCompactNegative}
              alt={theme.brand.name}
              sx={{ height: 32, display: { xs: 'none', md: 'block' } }}
            />
          </Box>

          <Typography variant="h4" component="p" noWrap sx={{ display: { md: 'none' }, minWidth: 0 }}>
            {activeItem?.label ?? PUBLIC_SECTION_TITLE}
          </Typography>

          {!isVisitor && (
            <Box component="nav" aria-label="Navegación principal" sx={{ display: { xs: 'none', md: 'flex' }, ml: 4 }}>
              {navigationItems.map((item) => {
                const isActive = item === activeItem

                return (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    aria-current={isActive ? 'page' : undefined}
                    sx={{
                      height: 64,
                      px: 2,
                      borderRadius: 0,
                      color: isActive ? 'primary.contrastText' : 'grey.100',
                      borderBottom: 3,
                      borderColor: isActive ? 'secondary.main' : 'transparent',
                    }}
                  >
                    {item.label}
                  </Button>
                )
              })}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {isVisitor && (
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="inherit"
              sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              Iniciar sesión
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Header
