import type { ReactNode } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { authorOrSourceLabel, AuthorOrSourceText } from './AuthorOrSource'
import type { CatalogueEntry, ManuscriptWitness, Work } from './types'
import {
  findBaseWork,
  findRelatedParts,
  findWorkBySlug,
  formatCatalogNumber,
  getManuscripts,
  getSortedEntries,
  isBaseWork,
  workSlug,
} from './worksData'

function Fact({ label, value }: { label: string; value: ReactNode }) {
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
      <Typography variant="body2">{value}</Typography>
    </Stack>
  )
}

function partLabel(work: Work): string {
  if (work.lvVariant) {
    return `Fassung ${work.lvVariant}`
  }
  if (work.lvPart) {
    return `Teil ${work.lvPart}`
  }
  return 'Basiswerk'
}

function RelatedPartsTable({ parts }: { parts: Work[] }) {
  const authorOrSourceHeader = authorOrSourceLabel(
    parts.some((part) => part.textAuthors.length > 0),
    parts.some((part) => part.textSources.length > 0),
  )

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>LV</TableCell>
            <TableCell>Titel</TableCell>
            <TableCell>Stimmen</TableCell>
            <TableCell>Drucke</TableCell>
            <TableCell>{authorOrSourceHeader}</TableCell>
            <TableCell>Gesamtausgabe</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parts.map((part) => (
            <TableRow key={part['@id']}>
              <TableCell>{part.lv}</TableCell>
              <TableCell>{part.titles.join(' / ')}</TableCell>
              <TableCell>{part.voiceCounts.join(', ')}</TableCell>
              <TableCell>{part.prints.join(', ')}</TableCell>
              <TableCell>
                <AuthorOrSourceText authors={part.textAuthors} sources={part.textSources} />
              </TableCell>
              <TableCell>{part.completeEditions.join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function EntriesTable({ entries }: { entries: CatalogueEntry[] }) {
  const hasNotes = entries.some((entry) => entry.note)
  const authorOrSourceHeader = authorOrSourceLabel(
    entries.some((entry) => entry.textAuthor),
    entries.some((entry) => entry.textSource),
  )

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Druck</TableCell>
            <TableCell>Titel</TableCell>
            <TableCell>Stimmen</TableCell>
            <TableCell>{authorOrSourceHeader}</TableCell>
            <TableCell>Gesamtausgabe</TableCell>
            {hasNotes && <TableCell>Bemerkung</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry['@id']}>
              <TableCell>{entry.firstPrint ?? '–'}</TableCell>
              <TableCell>{entry.title ?? ''}</TableCell>
              <TableCell>{entry.voices ?? ''}</TableCell>
              <TableCell>
                <AuthorOrSourceText
                  authors={entry.textAuthor ? [entry.textAuthor] : []}
                  sources={entry.textSource ? [entry.textSource] : []}
                />
              </TableCell>
              <TableCell>{entry.completeEdition ?? ''}</TableCell>
              {hasNotes && <TableCell>{entry.note ?? ''}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// Kurzbeschreibung fuer die geschlossene Accordion-Zeile: Ort, Bibliothek
// und Signatur identifizieren eine Handschrift eindeutiger als ihr Titel,
// der oft mit dem des Werks uebereinstimmt.
function manuscriptSummary(manuscript: ManuscriptWitness): string {
  const parts = [manuscript.place, manuscript.library, manuscript.shelfmark].filter(
    (part): part is string => Boolean(part),
  )
  if (parts.length > 0) {
    return parts.join(', ')
  }
  return manuscript.title ?? `Handschrift ${manuscript.id}`
}

// Das RISM-Sigel als Fact-Wert: verlinkt auf den Online-Katalog, wenn die
// Quelle dafuer einen Link traegt (Spalte "Link", meist RISM, vereinzelt ein
// anderer Bibliothekskatalog), sonst schlichter Text. Fehlt umgekehrt das
// Sigel selbst bei vorhandenem Link (7 von 8939 Zeugnissen), dient "Katalog"
// als Linktext, damit der Verweis nicht verloren geht.
function rismValue(manuscript: ManuscriptWitness): ReactNode {
  if (!manuscript.rismSiglum && !manuscript.link) {
    return ''
  }
  if (!manuscript.link) {
    return manuscript.rismSiglum
  }
  return (
    <Link href={manuscript.link} target="_blank" rel="noopener noreferrer">
      {manuscript.rismSiglum ?? 'Katalog'}
    </Link>
  )
}

// Je Handschrift ein ausklappbares Panel statt einer Tabellenzeile, im
// gleichen Fact-Stil wie der Werkeintrag oben auf der Seite. Handschriften
// tragen mehr uneinheitliche, teils lange Angaben (Quellenart, Bemerkung)
// als die gedruckten Fassungen, dafuer aber weniger Datensaetze pro Werk;
// das macht eine dichte Tabelle hier weniger passend als aufklappbare
// Detailkarten.
function ManuscriptsAccordion({ manuscripts }: { manuscripts: ManuscriptWitness[] }) {
  return (
    <Stack spacing={1}>
      {manuscripts.map((manuscript) => (
        <Accordion key={manuscript['@id']} variant="outlined" disableGutters sx={{ '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              {manuscript.rismSiglum &&
                (manuscript.link ? (
                  <Tooltip title="Im Online-Katalog öffnen">
                    <Chip
                      component="a"
                      href={manuscript.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable
                      onClick={(event) => event.stopPropagation()}
                      label={manuscript.rismSiglum}
                      size="small"
                    />
                  </Tooltip>
                ) : (
                  <Chip label={manuscript.rismSiglum} size="small" />
                ))}
              <Typography variant="body2">{manuscriptSummary(manuscript)}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Fact label="RISM-Sigel" value={rismValue(manuscript)} />
              <Fact label="Ort" value={manuscript.place ?? ''} />
              <Fact label="Bibliothek" value={manuscript.library ?? ''} />
              <Fact label="Signatur" value={manuscript.shelfmark ?? ''} />
              <Fact label="Weitere Signatur" value={manuscript.shelfmarkAlt ?? ''} />
              <Fact label="Titel" value={manuscript.title ?? ''} />
              <Fact label="Stimmen" value={manuscript.voices ?? ''} />
              <Fact label="Datierung" value={manuscript.dating ?? ''} />
              <Fact label="Provenienz" value={manuscript.provenance ?? ''} />
              <Fact label="Quellenart" value={manuscript.sourceDescription ?? ''} />
              <Fact label="Bemerkung (Stück)" value={manuscript.note ?? ''} />
              <Fact label="Bemerkung (Quelle)" value={manuscript.sourceNote ?? ''} />
              <Fact label="Literatur" value={manuscript.literature ?? ''} />
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  )
}

export function WorkDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const work = slug ? findWorkBySlug(slug) : undefined

  if (!work) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Werk nicht gefunden.</Alert>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Zurück zur Übersicht
        </Button>
      </Container>
    )
  }

  const baseWork = !isBaseWork(work) && work.lvBase !== null ? findBaseWork(work.lvBase) : undefined
  const relatedParts = findRelatedParts(work)
  const [firstEntry, ...remainingEntries] = getSortedEntries(work)
  const manuscriptWitnesses = getManuscripts(work)

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 }, overflowY: 'auto', flex: 1, minHeight: 0 }}>
      <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Zurück zur Übersicht
      </Button>

      {baseWork && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Dies ist {partLabel(work).toLowerCase()} von Werk LV {baseWork.lv}.{' '}
          <Link component={RouterLink} to={`/werk/${workSlug(baseWork)}`}>
            Zum Basiswerk
          </Link>
          .
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip label={formatCatalogNumber(work)} size="small" sx={{ fontWeight: 700 }} />
          {!isBaseWork(work) && <Chip label={partLabel(work)} size="small" variant="outlined" />}
        </Stack>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
          {work.titles.join(' / ')}
        </Typography>

        <Stack spacing={1.5}>
          <Fact label="Stimmen" value={work.voiceCounts.join(', ')} />
          <Fact label="Erstdruck" value={firstEntry?.firstPrint ?? ''} />
          <Fact
            label={authorOrSourceLabel(work.textAuthors.length > 0, work.textSources.length > 0)}
            value={<AuthorOrSourceText authors={work.textAuthors} sources={work.textSources} />}
          />
          <Fact label="Gesamtausgabe" value={work.completeEditions.join(', ')} />
        </Stack>

        {remainingEntries.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Weitere Fassungen
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <EntriesTable entries={remainingEntries} />
            </Box>
          </>
        )}

        {manuscriptWitnesses.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Handschriftliche Überlieferung
            </Typography>
            <ManuscriptsAccordion manuscripts={manuscriptWitnesses} />
          </>
        )}

        {relatedParts.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Weitere Teile dieses Werks
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <RelatedPartsTable parts={relatedParts} />
            </Box>
          </>
        )}
      </Paper>
    </Container>
  )
}
