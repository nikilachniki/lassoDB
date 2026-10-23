import type { ReactNode } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// Ein einklappbarer Abschnitt der Detailseiten, standardmaessig geschlossen.
// unmountOnExit, weil manche Werke hunderte Handschriften haben, die sonst
// auch zugeklappt gerendert wuerden.
export function Section({
  title,
  count,
  defaultExpanded = false,
  children,
}: {
  title: string
  count?: number
  defaultExpanded?: boolean
  children: ReactNode
}) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      square
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{ '&::before': { display: 'none' }, borderTop: 1, borderColor: 'divider' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
        <Typography variant="h6" component="h3">
          {title}
          {count !== undefined && (
            <Typography component="span" color="text.secondary">
              {' '}({count})
            </Typography>
          )}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0 }}>{children}</AccordionDetails>
    </Accordion>
  )
}
