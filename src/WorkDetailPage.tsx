import { Link as RouterLink, useParams } from 'react-router-dom'
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
import type { CatalogueEntry, Work } from './types'
import { findBaseWork, findRelatedParts, findWorkBySlug, getSortedEntries, isBaseWork, workSlug } from './worksData'

function Fact({ label, value }: { label: string; value: string }) {
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
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>LV</TableCell>
            <TableCell>Titel</TableCell>
            <TableCell>Stimmen</TableCell>
            <TableCell>Drucke</TableCell>
            <TableCell>Textdichter / Textprovenienz</TableCell>
            <TableCell>Gesamtausgabe</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parts.map((part) => {
            const authors = part.textAuthors.join(', ')
            const sources = part.textSources.join(', ')
            const authorOrSource = authors && sources ? `${authors} / ${sources}` : authors || sources
            return (
              <TableRow key={part['@id']}>
                <TableCell>{part.lv}</TableCell>
                <TableCell>{part.titles.join(' / ')}</TableCell>
                <TableCell>{part.voiceCounts.join(', ')}</TableCell>
                <TableCell>{part.prints.join(', ')}</TableCell>
                <TableCell>{authorOrSource}</TableCell>
                <TableCell>{part.completeEditions.join(', ')}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function formatEntryAuthorOrSource(entry: CatalogueEntry): string {
  const author = entry.textAuthor ?? ''
  const source = entry.textSource ?? ''
  if (author && source) {
    return `${author} / ${source}`
  }
  return author || source
}

function EntriesTable({ entries }: { entries: CatalogueEntry[] }) {
  const hasNotes = entries.some((entry) => entry.note)

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Druck</TableCell>
            <TableCell>Titel</TableCell>
            <TableCell>Stimmen</TableCell>
            <TableCell>Textdichter / Textprovenienz</TableCell>
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
              <TableCell>{formatEntryAuthorOrSource(entry)}</TableCell>
              <TableCell>{entry.completeEdition ?? ''}</TableCell>
              {hasNotes && <TableCell>{entry.note ?? ''}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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

  const authors = work.textAuthors.join(', ')
  const sources = work.textSources.join(', ')
  const authorOrSource = authors && sources ? `${authors} / ${sources}` : authors || sources

  const baseWork = !isBaseWork(work) && work.lvBase !== null ? findBaseWork(work.lvBase) : undefined
  const relatedParts = findRelatedParts(work)
  const [firstEntry, ...remainingEntries] = getSortedEntries(work)

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
          <Chip label={`LV ${work.lv}`} size="small" sx={{ fontWeight: 700 }} />
          {!isBaseWork(work) && <Chip label={partLabel(work)} size="small" variant="outlined" />}
        </Stack>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 3 }}>
          {work.titles.join(' / ')}
        </Typography>

        <Stack spacing={1.5}>
          <Fact label="Stimmen" value={work.voiceCounts.join(', ')} />
          <Fact label="Erstdruck" value={firstEntry?.firstPrint ?? ''} />
          <Fact label="Textdichter / Textprovenienz" value={authorOrSource} />
          <Fact label="Gesamtausgabe" value={work.completeEditions.join(', ')} />
        </Stack>

        {remainingEntries.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Weitere Fassungen
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {remainingEntries.length === 1
                ? 'Eine weitere Fassung dieses Werks ist in einem anderen Druck überliefert.'
                : `${remainingEntries.length} weitere Fassungen dieses Werks sind in anderen Drucken überliefert.`}
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <EntriesTable entries={remainingEntries} />
            </Box>
          </>
        )}

        {relatedParts.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Weitere Teile dieses Werks
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {relatedParts.length === 1
                ? 'Ein weiterer Teilsatz bzw. eine weitere Fassung gehört zu diesem Werk.'
                : `${relatedParts.length} weitere Teilsätze bzw. Fassungen gehören zu diesem Werk.`}
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
