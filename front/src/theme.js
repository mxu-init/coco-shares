import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#1F2A44', contrastText: '#FFFFFF' },
    secondary: { main: '#F68D2E', contrastText: '#1F2A44' },
    background: { default: '#F5F6F8', paper: '#FFFFFF' },
    text: { primary: '#222430', secondary: '#656775' },
    success: { main: '#3E7E43' },
    error: { main: '#C12022' },
    warning: { main: '#FFA000' },
    info: { main: '#0E7AB8' },
  },
  typography: {
    fontFamily: '"Open Sans", Arial, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 600, lineHeight: '36px', color: '#1F2A44' },
    h2: { fontSize: '1.5rem', fontWeight: 600, lineHeight: '32px', color: '#1F2A44' },
    body1: { fontSize: '1rem', lineHeight: '24px' },
    body2: { fontSize: '0.875rem', lineHeight: '20px' },
    button: { fontSize: '0.9375rem', fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
})

export default theme