import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

function BottomNav({ navigationItems, activeItem }) {
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
          '& .MuiBottomNavigationAction-root': { color: 'grey.500' },
          '& .MuiBottomNavigationAction-root.Mui-selected': { color: 'primary.main' },
          '& .Mui-selected .MuiBottomNavigationAction-label': { fontWeight: 600 },
        }}
      >
        {navigationItems.map((item) => {
          const Icon = item === activeItem ? item.activeIcon : item.icon

          return (
            <BottomNavigationAction
              key={item.path}
              component={RouterLink}
              to={item.path}
              value={item.path}
              label={item.label}
              icon={<Icon />}
            />
          )
        })}
      </BottomNavigation>
    </Paper>
  )
}

export default BottomNav
