import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import type { SxProps, Theme } from '@mui/material/styles'

// RISM-Sigel einer Handschrift als Chip, gemeinsam fuer Werkliste und
// Detailseite. Mit Katalog-Link ist der Chip klickbar und oeffnet den
// Online-Katalog in einem neuen Tab; das Icon steht dann rechts vom Sigel.
// stopPropagation verhindert, dass der Klick zugleich die umgebende Zeile
// (Navigation in der DataGrid) bzw. das Akkordeon ausloest.
export function SiglumChip({
  siglum,
  link,
  maxWidth,
  sx,
}: {
  siglum: string
  link: string | null
  maxWidth: number
  sx?: SxProps<Theme>
}) {
  const style = [{ maxWidth }, ...(Array.isArray(sx) ? sx : [sx])]
  if (!link) {
    return (
      <Tooltip title={siglum}>
        <Chip size="small" label={siglum} sx={style} />
      </Tooltip>
    )
  }
  return (
    <Tooltip title={`${siglum} – im Online-Katalog öffnen`}>
      <Chip
        component="a"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        clickable
        onClick={(event) => event.stopPropagation()}
        size="small"
        label={siglum}
        icon={<OpenInNewIcon />}
        sx={[...style, { '& .MuiChip-icon': { order: 2, fontSize: 14, ml: -0.25, mr: 0.75 } }]}
      />
    </Tooltip>
  )
}
