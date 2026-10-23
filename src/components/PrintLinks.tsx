import { Link as RouterLink } from 'react-router-dom'
import Link from '@mui/material/Link'
import { findPrintBySiglum, printPath } from '../worksData.ts'

// Drucksigel als Links auf die Detailseite des jeweiligen Drucks. Ein Sigel
// ohne Eintrag in prints.json bleibt schlichter Text.
export function PrintLinks({ sigla }: { sigla: string[] }) {
  return (
    <>
      {sigla.map((siglum, index) => (
        <span key={siglum}>
          {index > 0 && ', '}
          {findPrintBySiglum(siglum) ? (
            <Link component={RouterLink} to={printPath(siglum)} onClick={(event) => event.stopPropagation()}>
              {siglum}
            </Link>
          ) : (
            siglum
          )}
        </span>
      ))}
    </>
  )
}
