import { Box, Button, Container, Paper, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

function EmptyState({ icon: Icon, title, description, actionLabel, actionPath }) {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 8 } }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon sx={{ fontSize: 32 }} />
        </Box>
        <Typography variant="h3" component="h1">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
        <Button
          component={RouterLink}
          to={actionPath}
          variant="contained"
          sx={{ mt: 1, minHeight: 48, width: { xs: '100%', sm: 'auto' } }}
        >
          {actionLabel}
        </Button>
      </Paper>
    </Container>
  )
}

export default EmptyState
