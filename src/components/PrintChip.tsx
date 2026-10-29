import { useNavigate } from 'react-router-dom'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import type { SxProps, Theme } from '@mui/material/styles'
import { findPrintBySiglum, formatPrintYear, printLabel, printPath } from '../worksData.ts'

// Drucksigel als Chip, der zur Detailseite des Drucks fuehrt, gemeinsam fuer
// Werkliste und Detailseite. Erstdrucke sind gefuellt, Nachdrucke umrandet.
// Der Kurztitel steht im Tooltip, siehe printLabel.
// stopPropagation verhindert, dass der Klick zugleich die umgebende Zeile
// (Navigation in der DataGrid) bzw. das Akkordeon ausloest.
export function PrintChip({
  siglum,
  firstPrint,
  maxWidth,
  sx,
}: {
  siglum: string
  firstPrint: boolean
  maxWidth?: number
  sx?: SxProps<Theme>
}) {
  const navigate = useNavigate()
  const print = findPrintBySiglum(siglum)
  const year = print?.dateApproximate ? formatPrintYear(print) : ''
  const fullLabel = print ? printLabel(print) : siglum
  const tooltip = [fullLabel, firstPrint ? 'Erstdruck' : '', year, print?.description ?? ''].filter(Boolean).join(' – ')
  return (
    <Tooltip title={tooltip}>
      <Chip
        size="small"
        label={siglum}
        variant={firstPrint ? 'filled' : 'outlined'}
        clickable={Boolean(print)}
        onClick={
          print
            ? (event) => {
                event.stopPropagation()
                navigate(printPath(siglum))
              }
            : undefined
        }
        sx={[{ maxWidth }, ...(Array.isArray(sx) ? sx : [sx])]}
      />
    </Tooltip>
  )
}
