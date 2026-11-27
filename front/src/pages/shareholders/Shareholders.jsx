import { useEffect, useState } from 'react'
import { Alert, Box, CircularProgress, Container, Pagination, Typography } from '@mui/material'
import ShareholderList from '../../components/ShareholderList/ShareholderList'
import { fetchShareholders } from '../../services/shareholderService'

const FIRST_PAGE = 1

function ShareholdersContent({ shareholdersPage, errorMessage, isLoading, onPageChange }) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress aria-label="Cargando accionistas" />
      </Box>
    )
  }

  if (errorMessage) return <Alert severity="error">{errorMessage}</Alert>

  if (shareholdersPage.total === 0) {
    return (
      <Typography variant="body1" color="text.secondary">
        Todavía no hay accionistas registrados.
      </Typography>
    )
  }

  const pageCount = Math.ceil(shareholdersPage.total / shareholdersPage.size)

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <ShareholderList shareholders={shareholdersPage.items} />
      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={shareholdersPage.page}
          onChange={(event, page) => onPageChange(page)}
          color="primary"
          sx={{ justifySelf: 'center' }}
        />
      )}
    </Box>
  )
}

function Shareholders() {
  const [page, setPage] = useState(FIRST_PAGE)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let isCurrentRequest = true

    fetchShareholders(page)
      .then((shareholdersPage) => {
        if (isCurrentRequest) setResult({ page, shareholdersPage, errorMessage: null })
      })
      .catch((error) => {
        if (isCurrentRequest) setResult({ page, shareholdersPage: null, errorMessage: error.message })
      })

    return () => {
      isCurrentRequest = false
    }
  }, [page])

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography variant="h1" sx={{ mb: { xs: 3, md: 4 } }}>
        Composición del accionariado
      </Typography>
      <ShareholdersContent
        shareholdersPage={result?.shareholdersPage}
        errorMessage={result?.errorMessage}
        isLoading={result?.page !== page}
        onPageChange={setPage}
      />
    </Container>
  )
}

export default Shareholders
