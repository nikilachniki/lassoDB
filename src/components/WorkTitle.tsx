import type { ReactNode } from 'react'
import Tooltip from '@mui/material/Tooltip'
import type { TitleBasis } from '../types.ts'

export const EARLIEST_SOURCE_HINT = 'Kein normalisierter Titel vorhanden; Titel nach der frühesten Quelle'

// Werktitel (preferredTitle). Ist er nicht normalisiert, sondern aus der
// fruehesten Quelle uebernommen, steht er kursiv und mit Hinweis im Tooltip,
// damit man die Schreibung der Quelle nicht fuer eine Normalisierung haelt.
export function WorkTitle({ basis, children }: { basis: TitleBasis; children: ReactNode }) {
  if (basis !== 'earliestSource') {
    return <>{children}</>
  }
  return (
    <Tooltip title={EARLIEST_SOURCE_HINT}>
      <span style={{ fontStyle: 'italic' }}>{children}</span>
    </Tooltip>
  )
}
