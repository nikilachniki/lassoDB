import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Eine Angabe der Detailseiten als Zeile aus Beschriftung und Wert. Leere
// Werte werden ausgelassen statt als leere Zeile zu erscheinen.
export function Fact({ label, value }: { label: string; value: ReactNode }) {
  if (!value) {
    return null
  }
  return (
    <Stack direction="row" spacing={2}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ width: 180, flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  )
}
