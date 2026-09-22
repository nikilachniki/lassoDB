import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import { DataGrid, type GridColDef, type GridRenderCellParams, type GridRowParams } from '@mui/x-data-grid'
import { AuthorOrSourceText } from './AuthorOrSource'
import type { Work } from './types'
import { getManuscripts, isBaseWork, workSlug, works } from './worksData'
import { collectDistinct, filterWorks, type WorksFilters } from './search/filterWorks'
import { WorksGridToolbar } from './search/WorksGridToolbar'
import { WorksSearchBar } from './search/WorksSearchBar'

interface Siglum {
  siglum: string
  link: string | null
}

interface Row {
  id: string
  lv: string
  title: string
  voiceCounts: string
  prints: string
  textAuthorOrSource: string
  textAuthors: string[]
  textSources: string[]
  completeEditions: string
  siglaText: string
  sigla: Siglum[]
  isPart: boolean
}

// LV-Nummern sind keine reinen Zahlen, etwa "100-2" oder "100 (I)". Ein
// simpler String-Vergleich sortiert "10" vor "2"; der numerische Vergleich
// von Intl behandelt die eingebetteten Zahlen dagegen als Zahlen.
const lvComparator = (a: string, b: string) => a.localeCompare(b, 'de', { numeric: true })

// Ein Werk hat entweder eine LV-Nummer oder, wenn es nur handschriftlich
// ueberliefert ist, eine Nummer aus dem LV-Anhang. Die Spalte bleibt "LV"
// ueberschrieben, zeigt fuer Anhang-Werke aber deren eigene Nummer, statt
// leer zu bleiben.
function formatLvColumn(work: Work): string {
  if (work.lv !== null) {
    return work.lv
  }
  if (work.lvAnh !== null) {
    return `Anh. ${work.lvAnh}`
  }
  return ''
}

// Ein Werk hat laut fachlicher Auskunft entweder einen Textdichter oder eine
// Textprovenienz, praktisch nie beides (in den Rohdaten 2 von 1.945 Werken).
// Fuer diese Ausnahmefaelle werden beide Werte gemeinsam angezeigt, statt
// eines davon stillschweigend zu verwerfen.
function formatTextAuthorOrSource(work: Work): string {
  const authors = work.textAuthors.join(', ')
  const sources = work.textSources.join(', ')
  if (authors && sources) {
    return `${authors} / ${sources}`
  }
  return authors || sources
}

// Die distinkten RISM-Sigel der Handschriften-Zeugnisse eines Werks, je mit
// dem Online-Katalog-Link des ersten Zeugnisses, das fuer dieses Sigel einen
// Link traegt. Mehrere Zeugnisse koennen dasselbe Sigel (dieselbe Bibliothek)
// tragen, etwa bei mehreren Signaturen derselben Sammlung; fuer die
// Uebersichtsspalte genuegt ein Vorkommen je Sigel statt einer Zeile je
// Zeugnis wie in der Detailansicht.
function manuscriptSigla(work: Work): Siglum[] {
  const links = new Map<string, string | null>()
  for (const manuscript of getManuscripts(work)) {
    if (!manuscript.rismSiglum) {
      continue
    }
    const existing = links.get(manuscript.rismSiglum)
    if (existing === undefined || (!existing && manuscript.link)) {
      links.set(manuscript.rismSiglum, manuscript.link)
    }
  }
  return Array.from(links.entries())
    .map(([siglum, link]) => ({ siglum, link }))
    .sort((a, b) => a.siglum.localeCompare(b.siglum))
}

// Klickbare Sigel in der Uebersichtsspalte, wie im RISM-Sigel-Fact der
// Detailansicht: ein Klick oeffnet den Online-Katalog in einem neuen Tab,
// ohne den Zeilenklick der DataGrid (Navigation zur Werk-Detailseite)
// auszuloesen.
function SiglaCell({ sigla }: { sigla: Siglum[] }) {
  if (sigla.length === 0) {
    return null
  }
  return (
    <span>
      {sigla.map((entry, index) => (
        <span key={entry.siglum}>
          {entry.link ? (
            <Link
              href={entry.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            >
              {entry.siglum}
            </Link>
          ) : (
            entry.siglum
          )}
          {index < sigla.length - 1 ? ', ' : ''}
        </span>
      ))}
    </span>
  )
}

const columns: GridColDef<Row>[] = [
  { field: 'lv', headerName: 'LV', width: 90, sortComparator: lvComparator },
  { field: 'title', headerName: 'Titel', flex: 1, minWidth: 220 },
  { field: 'voiceCounts', headerName: 'Stimmen', width: 110 },
  { field: 'prints', headerName: 'Drucke', width: 160 },
  {
    field: 'textAuthorOrSource',
    headerName: 'Textdichter / Textprovenienz',
    width: 260,
    // Der Zellwert (textAuthorOrSource) bleibt die reine Zeichenkette, damit
    // Sortierung, Filter und CSV/Druck-Export unveraendert darauf arbeiten;
    // nur die Darstellung zeigt zusaetzlich die GND/VIAF-Badges an, siehe
    // AuthorOrSourceText.
    renderCell: (params: GridRenderCellParams<Row>) => (
      <AuthorOrSourceText authors={params.row.textAuthors} sources={params.row.textSources} />
    ),
  },
  { field: 'completeEditions', headerName: 'Gesamtausgabe', width: 200 },
  {
    field: 'siglaText',
    headerName: 'RISM-Sigel',
    width: 160,
    renderCell: (params: GridRenderCellParams<Row>) => <SiglaCell sigla={params.row.sigla} />,
  },
]

interface WorksPageProps {
  filters: WorksFilters
  onFiltersChange: (filters: WorksFilters) => void
}

export function WorksPage({ filters, onFiltersChange }: WorksPageProps) {
  const navigate = useNavigate()

  const authorOptions = useMemo(
    () => collectDistinct(works, (work) => work.textAuthors).sort((a, b) => a.localeCompare(b, 'de')),
    [],
  )
  const voiceCountOptions = useMemo(
    () => collectDistinct(works, (work) => work.voiceCounts).sort((a, b) => a - b),
    [],
  )

  const filteredWorks = useMemo(() => filterWorks(works, filters), [filters])

  const rows = useMemo<Row[]>(
    () =>
      filteredWorks.map((work) => {
        const sigla = manuscriptSigla(work)
        return {
          id: work['@id'],
          lv: formatLvColumn(work),
          title: work.titles.join(' / '),
          voiceCounts: work.voiceCounts.join(', '),
          prints: work.prints.join(', '),
          textAuthorOrSource: formatTextAuthorOrSource(work),
          textAuthors: work.textAuthors,
          textSources: work.textSources,
          completeEditions: work.completeEditions.join(', '),
          siglaText: sigla.map((entry) => entry.siglum).join(', '),
          sigla,
          isPart: !isBaseWork(work),
        }
      }),
    [filteredWorks],
  )

  const handleRowClick = (params: GridRowParams<Row>) => {
    if (params.row.isPart) {
      return
    }
    navigate(`/werk/${workSlug({ '@id': params.row.id })}`)
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', py: { xs: 1.5, sm: 2 } }}
    >
      <WorksSearchBar
        filters={filters}
        onFiltersChange={onFiltersChange}
        authorOptions={authorOptions}
        voiceCountOptions={voiceCountOptions}
        resultCount={rows.length}
        totalCount={works.length}
      />
      <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          showToolbar
          slots={{ toolbar: WorksGridToolbar }}
          slotProps={{ toolbar: { works: filteredWorks } }}
          initialState={{
            pagination: { paginationModel: { pageSize: 100 } },
            sorting: { sortModel: [{ field: 'lv', sort: 'asc' }] },
          }}
          pageSizeOptions={[25, 50, 100]}
          density="compact"
          disableRowSelectionOnClick
          getRowClassName={(params) => (params.row.isPart ? 'lasso-row-part' : 'lasso-row-clickable')}
          onRowClick={handleRowClick}
          sx={{
            flex: 1,
            border: 0,
            '& .MuiTablePagination-toolbar': { minHeight: 40 },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: 0,
            },
            '& .lasso-row-clickable': { cursor: 'pointer' },
            '& .lasso-row-part': { opacity: 0.55 },
            '& .lasso-row-part:hover': { backgroundColor: 'transparent' },
          }}
        />
      </Paper>
    </Container>
  )
}
