import { useNavigate, useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
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
import { BackButton } from '../components/BackButton.tsx'
import { Fact } from '../components/Fact.tsx'
import { PrintRism } from '../components/PrintRism.tsx'
import { authorOrSourceLabel, AuthorOrSourceText } from '../helpers.tsx'
import {
  findPrintBySiglum,
  formatCatalogNumber,
  formatPrintYear,
  getPrintContents,
  mainTitle,
  textAuthorLabels,
  workSlug,
  type WorkInPrint,
} from '../worksData.ts'

// Die Werke eines Drucks in der Reihenfolge der Stuecke. Die Angaben stammen
// vom Werk, weil Nachdrucke keine eigenen Eintraege haben; der Titel in der
// Schreibung des Drucks steht, wo bekannt, im Tooltip. Ein Klick fuehrt zum Werk.
function PrintContentsTable({ contents }: { contents: WorkInPrint[] }) {
  const navigate = useNavigate()
  const works = contents.map(({ work }) => work)
  const authorOrSourceHeader = authorOrSourceLabel(
    works.some((work) => work.textAuthors.length > 0),
    works.some((work) => work.textSources.length > 0),
  )
  const hasPieces = contents.some((content) => content.piece)
  const hasNotes = contents.some((content) => content.note)
  const hasGenres = works.some((work) => work.genres.length > 0)
  const hasLanguages = works.some((work) => work.languages.length > 0)

  // Teile haben keine eigene Detailseite, siehe WorksPage.handleRowClick.
  const openWork = ({ work }: WorkInPrint) => {
    if (work.isPartOf) {
      navigate(`/werk/${workSlug({ '@id': work.isPartOf })}`, { state: { focusPart: work['@id'] } })
      return
    }
    navigate(`/werk/${workSlug(work)}`)
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {hasPieces && <TableCell>Stück</TableCell>}
            <TableCell>LV</TableCell>
            <TableCell>Titel</TableCell>
            <TableCell>Stimmen</TableCell>
            <TableCell>{authorOrSourceHeader}</TableCell>
            <TableCell>Gesamtausgabe</TableCell>
            {hasGenres && <TableCell>Gattung</TableCell>}
            {hasLanguages && <TableCell>Sprache</TableCell>}
            {hasNotes && <TableCell>Zusatz</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {contents.map((content) => {
            const { work, entries } = content
            const printTitles = entries
              .map((entry) => entry.title)
              .filter((title): title is string => Boolean(title) && title !== mainTitle(work))
            return (
              <TableRow
                key={`${work['@id']}|${content.siglum}`}
                hover
                onClick={() => openWork(content)}
                sx={{ cursor: 'pointer' }}
              >
                {hasPieces && <TableCell sx={{ whiteSpace: 'nowrap' }}>{content.piece}</TableCell>}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {work.lv ?? formatCatalogNumber(work)}
                  {entries.length > 0 && (
                    <Tooltip title="Erstdruck: das Werk oder ein Teil davon erschien hier zum ersten Mal">
                      <Chip label="Erstdruck" size="small" variant="outlined" sx={{ ml: 1 }} />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell
                  title={printTitles.length > 0 ? `Im Druck: ${printTitles.join(' / ')}` : undefined}
                >
                  {mainTitle(work)}
                </TableCell>
                <TableCell>{work.voiceCounts.join(', ')}</TableCell>
                <TableCell>
                  <AuthorOrSourceText authors={textAuthorLabels(work)} sources={work.textSources} />
                </TableCell>
                <TableCell>{work.completeEditions.join(', ')}</TableCell>
                {hasGenres && <TableCell>{work.genres.join(', ')}</TableCell>}
                {hasLanguages && <TableCell>{work.languages.join(', ')}</TableCell>}
                {hasNotes && <TableCell>{content.note}</TableCell>}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function PrintDetailPage() {
  const { siglum } = useParams<{ siglum: string }>()
  const print = siglum ? findPrintBySiglum(siglum) : undefined

  if (!print) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Druck nicht gefunden.</Alert>
        <Box sx={{ mt: 2 }}>
          <BackButton overviewPath="/drucke" />
        </Box>
      </Container>
    )
  }

  const contents = getPrintContents(print)

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, overflowY: 'auto', flex: 1, minHeight: 0 }}>
      <BackButton overviewPath="/drucke" />

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip label="Druck" size="small" sx={{ fontWeight: 700 }} />
          {print.part && <Chip label={`Band ${print.part}`} size="small" variant="outlined" />}
        </Stack>
        <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
          {print.siglum}
        </Typography>

        <Stack spacing={1.5}>
          <Fact label="Jahr" value={formatPrintYear(print)} />
          <Fact label="RISM" value={print.rism || print.rismSeries.length > 0 ? <PrintRism print={print} /> : ''} />
          <Fact label="Werke" value={contents.length} />
          <Fact label="davon Erstdrucke" value={print.entryCount} />
        </Stack>

        <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1 }}>
          Enthaltene Werke{' '}
          <Typography component="span" color="text.secondary">
            ({contents.length})
          </Typography>
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <PrintContentsTable contents={contents} />
        </Box>
      </Paper>
    </Container>
  )
}
