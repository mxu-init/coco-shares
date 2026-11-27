import { Box, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import ShareholderCard from '../ShareholderCard/ShareholderCard'
import ShareholderTable from '../ShareholderTable/ShareholderTable'

function ShareholderList({ shareholders }) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  if (isDesktop) return <ShareholderTable shareholders={shareholders} />

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      {shareholders.map((shareholder) => (
        <ShareholderCard key={shareholder.id} shareholder={shareholder} />
      ))}
    </Box>
  )
}

export default ShareholderList
