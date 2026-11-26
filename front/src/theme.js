import { createTheme } from '@mui/material/styles'
import cohispaniaLogo from './assets/images/cohispaniaLogo.svg'
import cohispaniaLogoNegative from './assets/images/cohispaniaLogoNegative.svg'
import cohispaniaLogoCompactNegative from './assets/images/cohispaniaLogoCompactNegative.png'
import cohispaniaIsotype from './assets/images/cohispaniaIsotype.png'

const brandColors = {
  blue: '#1F2A44',
  blueHover: '#2B3A5E',
  blueDark: '#141C30',
  blueTint: '#E9ECF3',
  orange: '#F68D2E',
  orangeDark: '#E87128',
  orangeTint: '#FEF1E5',
  orangeText: '#A3520C',
  white: '#FFFFFF',
}

const grey = {
  50: '#E9EAEC',
  100: '#C9C9CE',
  200: '#A5A6AE',
  300: '#80828E',
  400: '#656775',
  500: '#535463',
  600: '#434555',
  700: '#3A3C4B',
  800: '#2F303F',
  900: '#222430',
}

const desktopMediaQuery = '@media (min-width:900px)'

const theme = createTheme({
  palette: {
    primary: {
      main: brandColors.blue,
      dark: brandColors.blueDark,
      light: brandColors.blueTint,
      contrastText: brandColors.white,
    },
    secondary: {
      main: brandColors.orange,
      dark: brandColors.orangeDark,
      light: brandColors.orangeTint,
      contrastText: brandColors.blue,
    },
    success: { main: '#3E7E43', dark: '#2F6A35', light: '#E7F2E8' },
    error: { main: '#C12022', light: '#FBE8E8' },
    warning: { main: '#FFA000', dark: '#8A5300', light: '#FFF6DC', contrastText: brandColors.blue },
    info: { main: '#0E7AB8', dark: '#0B6AA1', light: '#E8F3FA' },
    background: { default: '#F5F6F8', paper: brandColors.white },
    text: { primary: grey[900], secondary: grey[400], disabled: grey[200] },
    divider: grey[50],
    grey,
    accentText: brandColors.orangeText,
    primaryHover: brandColors.blueHover,
  },
  typography: {
    fontFamily: '"Open Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '1.75rem',
      lineHeight: '2.25rem',
      fontWeight: 600,
      color: brandColors.blue,
      [desktopMediaQuery]: { fontSize: '2.5rem', lineHeight: '3rem' },
    },
    h2: {
      fontSize: '1.5rem',
      lineHeight: '2rem',
      fontWeight: 600,
      color: brandColors.blue,
      [desktopMediaQuery]: { fontSize: '2rem', lineHeight: '2.5rem' },
    },
    h3: {
      fontSize: '1.25rem',
      lineHeight: '1.75rem',
      fontWeight: 600,
      color: brandColors.blue,
      [desktopMediaQuery]: { fontSize: '1.5rem', lineHeight: '2rem' },
    },
    h4: { fontSize: '1.125rem', lineHeight: '1.625rem', fontWeight: 600, color: brandColors.blue },
    subtitle1: { fontSize: '1rem', lineHeight: '1.5rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: '1.5rem' },
    body2: { fontSize: '0.875rem', lineHeight: '1.25rem' },
    button: {
      fontSize: '0.9375rem',
      lineHeight: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
    caption: { fontSize: '0.75rem', lineHeight: '1rem' },
    overline: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: 600, letterSpacing: '0.08em' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        sizeSmall: {
          position: 'relative',
          minHeight: 36,
          padding: '0 16px',
          fontSize: '0.875rem',
          '&::after': { content: '""', position: 'absolute', inset: '-7px 0' },
        },
      },
    },
  },
  brand: {
    name: 'CoHispania',
    logo: cohispaniaLogo,
    logoNegative: cohispaniaLogoNegative,
    logoCompactNegative: cohispaniaLogoCompactNegative,
    isotype: cohispaniaIsotype,
  },
})

export default theme
