import Link from '@mui/material/Link'
import Tooltip from '@mui/material/Tooltip'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import type { Print } from '../types.ts'
import { printRism } from '../worksData.ts'
import { ExternalChip } from './ExternalChip.tsx'

// Abzeichen "RISM", das den Druck in RISM Online oeffnet, im Stil der
// GND/VIAF-Badges der Textdichter, fuer Tabellen wie die Druckuebersicht.
// Auf den Detailseiten steht stattdessen PrintRism. Ohne Link nichts.
// stopPropagation verhindert, dass der Klick zugleich die umgebende Zeile
// bzw. das Akkordeon ausloest.
export function RismBadge({ print }: { print: Print }) {
  const rism = printRism(print)
  if (!rism?.url) {
    return null
  }
  const basis = rism.confirmed ? '' : ' (laut Druckeverzeichnis)'
  return (
    <Tooltip title={`RISM ${rism.label ?? ''}${basis} – in RISM Online öffnen`.replace('  ', ' ')}>
      <Link
        href={rism.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="In RISM Online öffnen"
        onClick={(event) => event.stopPropagation()}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          px: 0.75,
          height: 20,
          borderRadius: 0.75,
          fontSize: '0.7rem',
          fontWeight: 700,
          lineHeight: 1,
          color: '#fff',
          backgroundColor: 'authority.rism',
          textDecoration: 'none',
          verticalAlign: 'middle',
          flexShrink: 0,
          '&:hover': { filter: 'brightness(1.15)' },
        }}
      >
        RISM
        <OpenInNewIcon sx={{ fontSize: 12 }} />
      </Link>
    </Tooltip>
  )
}

// RISM-Angabe als Wert der Detailseiten. Das Feld heisst schon "RISM", deshalb
// hier kein Abzeichen: die Nummer selbst ist der Chip zu RISM Online.
export function PrintRism({ print }: { print: Print }) {
  const rism = printRism(print)
  if (!rism) {
    return null
  }
  if (!rism.url) {
    return <>{rism.label}</>
  }
  return (
    <ExternalChip
      label={rism.label ?? 'RISM Online'}
      href={rism.url}
      tooltip={`RISM ${rism.label ?? ''} – in RISM Online öffnen`.replace('  ', ' ')}
    />
  )
}
