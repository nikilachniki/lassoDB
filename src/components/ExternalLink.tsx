import type { ReactNode } from 'react'
import Link from '@mui/material/Link'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

// Link auf eine fremde Seite: oeffnet in neuem Tab und traegt dahinter das
// Pfeil-Icon, damit vor dem Klick erkennbar ist, dass die Anwendung
// verlassen wird.
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
    >
      {children}
      <OpenInNewIcon sx={{ fontSize: '0.9em' }} />
    </Link>
  )
}
