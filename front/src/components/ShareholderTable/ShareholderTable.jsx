import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  formatShareCapital,
  formatSharesCount,
  formatSharesPercentage,
  getShareholderName,
} from '../ShareholderList/shareholderFormatters'

const headCellSx = {
  color: 'text.secondary',
  fontWeight: 600,
  borderBottom: 2,
  borderBottomColor: 'primary.main',
}

const numericCellSx = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
}

function ShareholderTable({ shareholders }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table aria-label="Composición del accionariado">
        <TableHead>
          <TableRow>
            <TableCell sx={headCellSx}>Accionista</TableCell>
            <TableCell sx={headCellSx}>Representante</TableCell>
            <TableCell sx={{ ...headCellSx, ...numericCellSx }}>Nº de acciones</TableCell>
            <TableCell sx={{ ...headCellSx, ...numericCellSx }}>% de acciones</TableCell>
            <TableCell sx={{ ...headCellSx, ...numericCellSx }}>Capital social</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shareholders.map((shareholder) => (
            <TableRow
              key={shareholder.id}
              sx={{ '&:nth-of-type(even)': { bgcolor: 'background.default' } }}
            >
              <TableCell>{getShareholderName(shareholder)}</TableCell>
              <TableCell>{shareholder.representative_name ?? '—'}</TableCell>
              <TableCell sx={numericCellSx}>{formatSharesCount(shareholder.shares_count)}</TableCell>
              <TableCell sx={numericCellSx}>
                {formatSharesPercentage(shareholder.shares_percentage)}
              </TableCell>
              <TableCell sx={numericCellSx}>{formatShareCapital(shareholder.share_capital)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ShareholderTable
