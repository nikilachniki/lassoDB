import Stack from '@mui/material/Stack'
import { PrintChip } from './PrintChip.tsx'

// Drucksigel als Reihe von Chips, die zur Detailseite des jeweiligen Drucks
// fuehren. Die Sigel stammen aus den Eintraegen und sind damit Erstdrucke.
export function PrintChips({ sigla }: { sigla: string[] }) {
  return (
    <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
      {sigla.map((siglum) => (
        <PrintChip key={siglum} siglum={siglum} firstPrint />
      ))}
    </Stack>
  )
}
