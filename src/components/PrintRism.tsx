import Link from '@mui/material/Link'
import type { Print } from '../types.ts'

// RISM-Angabe eines Drucks: die Reihennummern (etwa "A/I L 955"), verlinkt
// auf RISM Online, wenn die Kennung eine Adresse ist. Ohne bestaetigte
// Zuordnung (lassoDBData, docs/entscheidungen.md, Abschnitt 25) leer.
export function PrintRism({ print }: { print: Print }) {
  const label = print.rismSeries.join('; ') || print.rism
  if (!label) {
    return null
  }
  if (print.rism?.startsWith('http')) {
    return (
      <Link href={print.rism} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
        {print.rismSeries.join('; ') || 'RISM Online'}
      </Link>
    )
  }
  return <>{label}</>
}
