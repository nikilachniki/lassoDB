import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

interface InfoDialogProps {
  open: boolean
  onClose: () => void
}

function FootnoteRef({ n }: { n: number }) {
  return (
    <Box
      component="sup"
      sx={{ fontSize: '0.75em', fontWeight: 700, color: 'primary.main', ml: '1px' }}
    >
      {n}
    </Box>
  )
}

export function InfoDialog({ open, onClose }: InfoDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        Über dieses Projekt
        <IconButton aria-label="Schließen" onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
              Die Datenbank
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Orlando di Lasso (1532–1594) gilt als einer der bedeutendsten Komponisten des 16.
              Jahrhunderts. Sein Œuvre umfasst mehr als 1360 Werke, überliefert in über 470
              zeitgenössischen Drucken aus den Jahren 1555 bis 1687 sowie in einer erheblich
              größeren Zahl an Handschriften.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Diese Datenbank führt die gedruckte Überlieferung nach der Zählung des
              LV-Katalogs
              <FootnoteRef n={1} /> mit der handschriftlichen Überlieferung der
              Lasso-Handschriften-Datenbank
              <FootnoteRef n={2} /> zusammen und macht beide gemeinsam durchsuch- und filterbar.
            </Typography>
            <Box
              sx={{
                pl: 1.5,
                py: 0.5,
                borderLeft: '3px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 0.75 }}>
                <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  [1]
                </Box>{' '}
                Horst Leuchtmann und Bernhold Schmid,{' '}
                <Box component="span" sx={{ fontStyle: 'italic' }}>
                  Orlando di Lasso: Seine Werke in zeitgenössischen Drucken 1555–1687
                </Box>
                . Supplement zur Ausgabe „Orlando di Lasso, Sämtliche Werke“, 3 Bde., Kassel u. a.
                2001.
              </Typography>
              <Typography variant="caption" color="text.secondary" component="p">
                <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  [2]
                </Box>{' '}
                <Link
                  href="https://lasso-handschriften.badw.de/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
                >
                  https://lasso-handschriften.badw.de/
                  <OpenInNewIcon sx={{ fontSize: '0.9em' }} />
                </Link>
                , bearb. und hrsg. von Tobias Apelt, Daniela von Aretin und Adelheid Schellmann
                unter Mitarbeit von Alexander Heinzel und Bernhold Schmid.
              </Typography>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
              Das Digital Lab
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Die Datenbank entsteht im Digital Lab der Gesellschaft für Bayerische
              Musikgeschichte e. V., einer Arbeitsgruppe junger Musikwissenschaftler*innen an
              bayerischen Forschungseinrichtungen. Das Digital Lab wird von Dr. Moritz Kelber
              geleitet und steht allen Interessierten zur Mitarbeit offen. Seit Anfang 2026
              arbeitet ein Team aus vier Wissenschaftler*innen am Aufbau einer gemeinsamen
              digitalen Infrastruktur für Werkverzeichnisse. Es entwickelt digitale Lösungen für
              die Erschließung musikwissenschaftlicher Werkverzeichnisse: bestehende Verzeichnisse
              werden zusammengeführt, neue erarbeitet und die Daten nach den FAIR-Prinzipien frei
              nachnutzbar bereitgestellt. Neben Orlando di Lasso widmet sich das Digital Lab den
              Werkverzeichnissen von Hans Leo Hassler, Luise Adolpha Le Beau und Emanuel Moór, in
              Zusammenarbeit mit dem Centre for Digital Music Documentation an der Akademie der
              Wissenschaften und der Literatur Mainz sowie der Ludwig-Maximilians-Universität
              München.
            </Typography>
            <Link
              href="https://gfbm-online.de/laufende-editionsprojekte/digitallab/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
            >
              Mehr zum Digital Lab
              <OpenInNewIcon sx={{ fontSize: '0.9em' }} />
            </Link>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
              Daten &amp; Quellcode
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Der vollständige Datenbestand samt Herkunftsnachweis steht im
              Repository{' '}
              <Link
                href="https://github.com/nikilachniki/lassoDBData"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
              >
                lassoDBData
                <OpenInNewIcon sx={{ fontSize: '0.9em' }} />
              </Link>{' '}
              bereit. Die Anwendung selbst ist quelloffen unter MIT-Lizenz in{' '}
              <Link
                href="https://github.com/nikilachniki/lassoDB"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
              >
                lassoDB
                <OpenInNewIcon sx={{ fontSize: '0.9em' }} />
              </Link>
              .
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
