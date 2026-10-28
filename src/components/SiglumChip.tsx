import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import type { SxProps, Theme } from '@mui/material/styles'
import { ExternalChip } from './ExternalChip.tsx'

// RISM-Sigel einer Handschrift als Chip, gemeinsam fuer Werkliste und
// Detailseite. Mit Katalog-Link ist der Chip klickbar und oeffnet den
// Online-Katalog in einem neuen Tab, siehe ExternalChip.
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
  if (!link) {
    return (
      <Tooltip title={siglum}>
        <Chip size="small" label={siglum} sx={[{ maxWidth }, ...(Array.isArray(sx) ? sx : [sx])]} />
      </Tooltip>
    )
  }
  return (
    <ExternalChip
      label={siglum}
      href={link}
      tooltip={`${siglum} – im Online-Katalog öffnen`}
      maxWidth={maxWidth}
      sx={sx}
    />
  )
}
