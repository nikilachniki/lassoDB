import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid'
import type { Work } from './types'
import { isBaseWork, workSlug, works } from './worksData'
import { collectDistinct, filterWorks, type WorksFilters } from './search/filterWorks'
import { WorksGridToolbar } from './search/WorksGridToolbar'
import { WorksSearchBar } from './search/WorksSearchBar'

interface Row {
  id: string
  lv: string
  title: string
  voiceCounts: string
  prints: string
  textAuthorOrSource: string
  completeEditions: string
  isPart: boolean
}

// LV-Nummern sind keine reinen Zahlen, etwa "100-2" oder "100 (I)". Ein
// simpler String-Vergleich sortiert "10" vor "2"; der numerische Vergleich
// von Intl behandelt die eingebetteten Zahlen dagegen als Zahlen.
const lvComparator = (a: string, b: string) => a.localeCompare(b, 'de', { numeric: true })

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

const columns: GridColDef<Row>[] = [
  { field: 'lv', headerName: 'LV', width: 90, sortComparator: lvComparator },
  { field: 'title', headerName: 'Titel', flex: 1, minWidth: 220 },
  { field: 'voiceCounts', headerName: 'Stimmen', width: 110 },
  { field: 'prints', headerName: 'Drucke', width: 160 },
  { field: 'textAuthorOrSource', headerName: 'Textdichter / Textprovenienz', width: 240 },
  { field: 'completeEditions', headerName: 'Gesamtausgabe', width: 200 },
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
      filteredWorks.map((work) => ({
        id: work['@id'],
        lv: work.lv,
        title: work.titles.join(' / '),
        voiceCounts: work.voiceCounts.join(', '),
        prints: work.prints.join(', '),
        textAuthorOrSource: formatTextAuthorOrSource(work),
        completeEditions: work.completeEditions.join(', '),
        isPart: !isBaseWork(work),
      })),
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
