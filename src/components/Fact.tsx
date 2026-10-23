import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Eine Angabe der Detailseiten als Zeile aus Beschriftung und Wert. Leere
// Werte werden ausgelassen statt als leere Zeile zu erscheinen. labelWidth
// fuer schmale Spalten, etwa neben dem Titelblatt eines Drucks. Die
// Beschriftung ist klein, gesperrt und in Versalien gesetzt, damit sie sich
// nicht nur durch den Grauton vom Wert abhebt.
export function Fact({ label, value, labelWidth = 180 }: { label: string; value: ReactNode; labelWidth?: number }) {
  if (!value) {
    return null
  }
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'baseline' }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          width: labelWidth,
          flexShrink: 0,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  )
}
