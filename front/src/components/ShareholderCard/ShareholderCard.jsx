import { Box, Card, Typography } from '@mui/material'
import {
  formatShareCapital,
  formatSharesCount,
  formatSharesPercentage,
  getShareholderName,
} from '../ShareholderList/shareholderFormatters'

function ShareholderStat({ label, value }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.25 }}>
      <Typography variant="caption" component="dt" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="subtitle1"
        component="dd"
        sx={{ m: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Typography>
    </Box>
  )
}

function ShareholderCard({ shareholder }) {
  const sharesPercentage = Number(shareholder.shares_percentage)

  return (
    <Card component="article" variant="outlined" sx={{ display: 'grid', gap: 1.5, p: 2 }}>
      <Box>
        <Typography variant="subtitle1" component="h2">
          {getShareholderName(shareholder)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {shareholder.representative_name
            ? `Representante: ${shareholder.representative_name}`
            : 'Sin representante'}
        </Typography>
      </Box>
      <Box
        component="dl"
        sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}
      >
        <ShareholderStat label="Nº de acciones" value={formatSharesCount(shareholder.shares_count)} />
        <ShareholderStat label="% de acciones" value={formatSharesPercentage(sharesPercentage)} />
        <ShareholderStat label="Capital social" value={formatShareCapital(shareholder.share_capital)} />
      </Box>
      <Box
        role="img"
        aria-label={`${formatSharesPercentage(sharesPercentage)} de las acciones`}
        sx={{ height: 6, borderRadius: 1, bgcolor: 'primary.light', overflow: 'hidden' }}
      >
        <Box sx={{ width: `${sharesPercentage}%`, height: '100%', bgcolor: 'primary.main' }} />
      </Box>
    </Card>
  )
}

export default ShareholderCard
