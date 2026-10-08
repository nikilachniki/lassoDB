import { useEffect, useRef, type ReactNode } from 'react'
import { Navigate, Link as RouterLink, useLocation, useParams } from 'react-router-dom'
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
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { SiglumChip } from '../components/SiglumChip.tsx'
import { authorOrSourceLabel, AuthorOrSourceText } from '../helpers.tsx'
import type { CatalogueEntry, Expression, ManuscriptWitness, Work } from '../types.ts'
import {
  findRelatedParts,
  findWholeWork,
  findWorkByExpressionSlug,
  findWorkBySlug,
  formatCatalogNumber,
  getExpressions,
  getManuscripts,
  entryTextAuthorLabels,
  getSortedEntries,
  isBaseWork,
  mainTitle,
  textAuthorLabels,
  workSlug,
} from '../worksData.ts'

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
      <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  )
}

const URL_PATTERN = /(https?:\/\/[^\s<>"]+)/g

function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, i) => {
        if (i % 2 === 0) {
          return part
        }
        // Satzzeichen am Ende gehören meist nicht zur URL
        const url = part.replace(/[.,;:!?)\]]+$/, '')
        const trailing = part.slice(url.length)
        return (
          <span key={i}>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </Link>
            {trailing}
          </span>
        )
      })}
    </>
  )
}

function partLabel(work: Work): string {
  if (work.lvPart) {
    return `Teil ${work.lvPart}`
  }
  return 'Basiswerk'
}

// focusId: der Teil, ueber den man aus der Werktabelle hierher gekommen ist.
// Teile haben keine eigene Detailseite, deshalb wird er hier markiert und in
// den sichtbaren Bereich gescrollt.
function RelatedPartsTable({ parts, focusId }: { parts: Work[]; focusId?: string }) {
  const focusRef = useRef<HTMLTableRowElement>(null)
  const authorOrSourceHeader = authorOrSourceLabel(
    parts.some((part) => part.textAuthors.length > 0),
    parts.some((part) => part.textSources.length > 0),
  )
  const hasGenres = parts.some((part) => part.genres.length > 0)
  const hasLanguages = parts.some((part) => part.languages.length > 0)

  useEffect(() => {
    focusRef.current?.scrollIntoView({ block: 'center' })
  }, [focusId])

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
            {hasGenres && <TableCell>Gattung</TableCell>}
            {hasLanguages && <TableCell>Sprache</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {parts.map((part) => (
            <TableRow
              key={part['@id']}
              selected={part['@id'] === focusId}
              ref={part['@id'] === focusId ? focusRef : undefined}
            >
              <TableCell>{part.lv}</TableCell>
              <TableCell>{mainTitle(part)}</TableCell>
              <TableCell>{part.voiceCounts.join(', ')}</TableCell>
              <TableCell>{part.prints.join(', ')}</TableCell>
              <TableCell>
                <AuthorOrSourceText authors={textAuthorLabels(part)} sources={part.textSources} />
              </TableCell>
              <TableCell>{part.completeEditions.join(', ')}</TableCell>
              {hasGenres && <TableCell>{part.genres.join(', ')}</TableCell>}
              {hasLanguages && <TableCell>{part.languages.join(', ')}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// Die Fassungen (Expressions) eines Werks. "Teil" ist die roemische Ziffer
// aus der Quelle und bezeichnet den Teil des Werks, den die Fassung bringt.
function ExpressionsTable({ expressions }: { expressions: Expression[] }) {
  const authorOrSourceHeader = authorOrSourceLabel(
    expressions.some((expression) => expression.textAuthors.length > 0),
    expressions.some((expression) => expression.textSources.length > 0),
  )
  const hasGenres = expressions.some((expression) => expression.genres.length > 0)
  const hasLanguages = expressions.some((expression) => expression.languages.length > 0)

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Teil</TableCell>
            <TableCell>LV</TableCell>
            <TableCell>Titel</TableCell>
            <TableCell>Stimmen</TableCell>
            <TableCell>Druck</TableCell>
            <TableCell>{authorOrSourceHeader}</TableCell>
            <TableCell>Gesamtausgabe</TableCell>
            {hasGenres && <TableCell>Gattung</TableCell>}
            {hasLanguages && <TableCell>Sprache</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {expressions.map((expression) => (
            <TableRow key={expression['@id']}>
              <TableCell>{expression.pars}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{expression.lv}</TableCell>
              <TableCell>{mainTitle(expression)}</TableCell>
              <TableCell>{expression.voiceCounts.join(', ')}</TableCell>
              <TableCell>{expression.prints.join(', ')}</TableCell>
              <TableCell>
                <AuthorOrSourceText authors={textAuthorLabels(expression)} sources={expression.textSources} />
              </TableCell>
              <TableCell>{expression.completeEditions.join(', ')}</TableCell>
              {hasGenres && <TableCell>{expression.genres.join(', ')}</TableCell>}
              {hasLanguages && <TableCell>{expression.languages.join(', ')}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function EntriesTable({ entries }: { entries: CatalogueEntry[] }) {
  const hasNotes = entries.some((entry) => entry.note)
  const hasGenres = entries.some((entry) => entry.genre)
  const hasLanguages = entries.some((entry) => entry.language)
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
            {hasGenres && <TableCell>Gattung</TableCell>}
            {hasLanguages && <TableCell>Sprache</TableCell>}
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
                  authors={entryTextAuthorLabels(entry)}
                  sources={entry.textSource ? [entry.textSource] : []}
                />
              </TableCell>
              <TableCell>{entry.completeEdition ?? ''}</TableCell>
              {hasGenres && <TableCell>{entry.genre ?? ''}</TableCell>}
              {hasLanguages && <TableCell>{entry.language ?? ''}</TableCell>}
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
        <Accordion key={manuscript['@id']} variant="outlined" disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
              {manuscript.rismSiglum && (
                <SiglumChip
                  siglum={manuscript.rismSiglum}
                  link={manuscript.link}
                  maxWidth={96}
                  sx={{ flexShrink: 0 }}
                />
              )}
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
              <Fact label="Literatur" value={manuscript.literature ? <Linkified text={manuscript.literature} /> : ''} />
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  )
}

export function WorkDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const focusPart = (useLocation().state as { focusPart?: string } | null)?.focusPart
  const work = slug ? findWorkBySlug(slug) : undefined

  // Alte Adresse einer Fassung (z.B. /werk/74-IV): zum zugehoerigen Werk.
  const expressionWork = !work && slug ? findWorkByExpressionSlug(slug) : undefined
  if (expressionWork) {
    return <Navigate to={`/werk/${workSlug(expressionWork)}`} replace />
  }

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

  const baseWork = findWholeWork(work)
  const relatedParts = findRelatedParts(work)
  const [firstEntry, ...remainingEntries] = getSortedEntries(work)
  const manuscriptWitnesses = getManuscripts(work)
  const expressions = getExpressions(work)

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
        <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
          {mainTitle(work)}
        </Typography>

        <Stack spacing={1.5}>
          <Fact label="Weitere Titel" value={work.variantTitles.join(' / ')} />
          <Fact label="Gattung" value={work.genres.join(', ')} />
          <Fact label="Sprache" value={work.languages.join(', ')} />
          <Fact label="Stimmen" value={work.voiceCounts.join(', ')} />
          <Fact label="Erstdruck" value={firstEntry?.firstPrint ?? ''} />
          <Fact
            label={authorOrSourceLabel(work.textAuthors.length > 0, work.textSources.length > 0)}
            value={<AuthorOrSourceText authors={textAuthorLabels(work)} sources={work.textSources} />}
          />
          <Fact label="Gesamtausgabe" value={work.completeEditions.join(', ')} />
        </Stack>

        {remainingEntries.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              Weitere Drucke
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <EntriesTable entries={remainingEntries} />
            </Box>
          </>
        )}

        {manuscriptWitnesses.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              Handschriftliche Überlieferung
            </Typography>
            <ManuscriptsAccordion manuscripts={manuscriptWitnesses} />
          </>
        )}

        {relatedParts.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              Weitere Teile dieses Werks
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <RelatedPartsTable parts={relatedParts} focusId={focusPart} />
            </Box>
          </>
        )}

        {expressions.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              Fassungen
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Einzelne Teile dieses Werks in abweichender Gestalt, meist mit anderer Stimmenzahl in
              einem anderen Druck.
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <ExpressionsTable expressions={expressions} />
            </Box>
          </>
        )}
      </Paper>
    </Container>
  )
}
