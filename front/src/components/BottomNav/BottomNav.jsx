import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

function BottomNav({ sectionItems, activeItem }) {
  return (
    <Paper
      component="nav"
      aria-label="Navegación principal"
      elevation={3}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        pb: 'env(safe-area-inset-bottom)',
        display: { md: 'none' },
      }}
    >
      <BottomNavigation
        showLabels
        value={activeItem?.path ?? null}
        sx={{
          height: 64,
          '& .MuiBottomNavigationAction-root': { minWidth: 0, px: 0, color: 'grey.500' },
          '& .MuiBottomNavigationAction-root.Mui-selected': { color: 'primary.main' },
          '& .MuiBottomNavigationAction-label, & .Mui-selected .MuiBottomNavigationAction-label': {
            typography: 'caption',
            letterSpacing: 0,
            mt: 0.5,
            whiteSpace: 'nowrap',
          },
          '& .Mui-selected .MuiBottomNavigationAction-label': { fontWeight: 600 },
        }}
      >
        {sectionItems.map((item) => {
          const isActive = item === activeItem
          const Icon = isActive ? item.activeIcon : item.icon

          return (
            <BottomNavigationAction
              key={item.path}
              component={RouterLink}
              to={item.path}
              value={item.path}
              label={item.label}
              aria-current={isActive ? 'page' : undefined}
              icon={
                <Box
                  sx={{
                    width: 56,
                    height: 32,
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: isActive ? 'primary.light' : 'transparent',
                  }}
                >
                  <Icon />
                </Box>
              }
            />
          )
        })}
      </BottomNavigation>
    </Paper>
  )
}

export default BottomNav
