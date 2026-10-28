import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import type { SxProps, Theme } from '@mui/material/styles'

// Verweis auf eine fremde Seite (Online-Katalog, Literatur) als Chip mit dem
// Pfeil-Icon rechts, das anzeigt, dass die Anwendung verlassen wird. Gegenstueck
// zu PrintChip fuer interne Verweise. stopPropagation verhindert, dass der Klick
// zugleich die umgebende Zeile bzw. das Akkordeon ausloest.
export function ExternalChip({
  label,
  href,
  tooltip,
  maxWidth,
  sx,
}: {
  label: string
  href: string
  tooltip?: string
  maxWidth?: number
  sx?: SxProps<Theme>
}) {
  return (
    <Tooltip title={tooltip ?? `${label} – in neuem Tab öffnen`}>
      <Chip
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        clickable
        onClick={(event) => event.stopPropagation()}
        size="small"
        label={label}
        icon={<OpenInNewIcon />}
        sx={[
          { maxWidth, '& .MuiChip-icon': { order: 2, fontSize: 14, ml: -0.25, mr: 0.75 } },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    </Tooltip>
  )
}
