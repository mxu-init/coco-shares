import { Box, Container, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const COMPANY_LEGAL_NAME = 'Compañía Hispania de Tasaciones y Valoraciones, S.A.'

const contactSections = [
  { title: 'Dirección', lines: ['Av. de Europa 34, Edif. B, Esc. izda., 3.º dcha.', '28023 Madrid · España'] },
  { title: 'Contacto', lines: ['91 307 00 35', 'info@cohispania.com'] },
]

function Footer() {
  const theme = useTheme()
  const currentYear = new Date().getFullYear()

  return (
    <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'grey.100' }}>
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 4, md: 6 },
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { md: '1fr 2fr' },
          alignItems: 'start',
        }}
      >
        <Box component="img" src={theme.brand.logoNegative} alt={theme.brand.name} sx={{ width: 180 }} />

        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { sm: 'repeat(2, 1fr)' } }}>
          {contactSections.map((section) => (
            <Box key={section.title}>
              <Typography variant="overline" component="p" sx={{ color: 'primary.contrastText' }}>
                {section.title}
              </Typography>
              {section.lines.map((line) => (
                <Typography key={line} variant="body2">
                  {line}
                </Typography>
              ))}
            </Box>
          ))}
        </Box>

        <Typography
          variant="caption"
          component="p"
          sx={{ gridColumn: '1 / -1', pt: 2, borderTop: 1, borderColor: 'grey.600' }}
        >
          © {currentYear} {COMPANY_LEGAL_NAME}
        </Typography>
      </Container>
    </Box>
  )
}

export default Footer
