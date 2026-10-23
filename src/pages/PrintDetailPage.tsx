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
import Typography from '@mui/material/Typography'
import { BackButton } from '../components/BackButton.tsx'
import { Fact } from '../components/Fact.tsx'
import { authorOrSourceLabel, AuthorOrSourceText } from '../helpers.tsx'
import {
  entryTextAuthorLabels,
  findPrintBySiglum,
  getPrintContents,
  mainTitle,
  workSlug,
  type PrintContent,
} from '../worksData.ts'

// Die Werke eines Drucks. Titel, Stimmen und Textdichter stehen wie im Druck
// selbst (Eintrag), nicht normalisiert; ein Klick fuehrt zum Werk.
function PrintContentsTable({ contents }: { contents: PrintContent[] }) {
  const navigate = useNavigate()
  const entries = contents.map(({ entry }) => entry)
  const authorOrSourceHeader = authorOrSourceLabel(
    entries.some((entry) => entry.textAuthor),
    entries.some((entry) => entry.textSource),
  )
  const hasGenres = entries.some((entry) => entry.genre)
  const hasLanguages = entries.some((entry) => entry.language)
  const hasNotes = entries.some((entry) => entry.note)

  // Teile haben keine eigene Detailseite, siehe WorksPage.handleRowClick.
  const openWork = ({ work }: PrintContent) => {
    if (!work) {
      return
    }
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
            <TableCell>LV</TableCell>
            <TableCell>Titel im Druck</TableCell>
            <TableCell>Stimmen</TableCell>
            <TableCell>{authorOrSourceHeader}</TableCell>
            <TableCell>Gesamtausgabe</TableCell>
            {hasGenres && <TableCell>Gattung</TableCell>}
            {hasLanguages && <TableCell>Sprache</TableCell>}
            {hasNotes && <TableCell>Bemerkung</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {contents.map((content) => {
            const { entry, work } = content
            const workTitle = work ? mainTitle(work) : ''
            return (
              <TableRow
                key={entry['@id']}
                hover={Boolean(work)}
                onClick={() => openWork(content)}
                sx={{ cursor: work ? 'pointer' : undefined }}
              >
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{entry.lv}</TableCell>
                <TableCell title={workTitle && workTitle !== entry.title ? `Werktitel: ${workTitle}` : undefined}>
                  {entry.title ?? workTitle}
                </TableCell>
                <TableCell>{entry.voices ?? entry.voicesRaw}</TableCell>
                <TableCell>
                  <AuthorOrSourceText
                    authors={entryTextAuthorLabels(entry)}
                    sources={entry.textSource ? [entry.textSource] : []}
                  />
                </TableCell>
                <TableCell>{entry.completeEdition}</TableCell>
                {hasGenres && <TableCell>{entry.genre}</TableCell>}
                {hasLanguages && <TableCell>{entry.language}</TableCell>}
                {hasNotes && <TableCell>{entry.note}</TableCell>}
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
        </Stack>
        <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
          {print.siglum}
        </Typography>

        <Stack spacing={1.5}>
          <Fact label="Jahr" value={print.year ?? ''} />
          <Fact label="Nummer" value={print.no ?? ''} />
          <Fact label="RISM" value={print.rism ?? ''} />
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
