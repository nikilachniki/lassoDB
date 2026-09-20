import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { DataGrid, GridToolbar, type GridColDef } from '@mui/x-data-grid'
import worksFile from './data/works.json'
import metaFile from './data/meta.json'
import type { WorksFile } from './types'

// Die JSON-Importe sind zur Buildzeit eingebunden, siehe scripts/sync-data.mjs.
// Es gibt keinen Server und keine Laufzeitabfrage, der gesamte Bestand liegt
// im Bundle und wird clientseitig durchsucht und gefiltert.
const works = (worksFile as WorksFile).items

interface Row {
  id: string
  lv: string
  title: string
  voiceCounts: string
  prints: string
  textAuthors: string
  completeEditions: string
  entryCount: number
}

const columns: GridColDef<Row>[] = [
  { field: 'lv', headerName: 'LV', width: 90 },
  { field: 'title', headerName: 'Titel', flex: 1, minWidth: 220 },
  { field: 'voiceCounts', headerName: 'Stimmen', width: 110 },
  { field: 'prints', headerName: 'Erstdruck', width: 160 },
  { field: 'textAuthors', headerName: 'Textdichter', width: 180 },
  { field: 'completeEditions', headerName: 'Gesamtausgabe', width: 200 },
  { field: 'entryCount', headerName: 'Drucke', width: 90 },
]

function App() {
  const rows = useMemo<Row[]>(
    () =>
      works.map((work) => ({
        id: work['@id'],
        lv: work.lv,
        title: work.titles.join(' / '),
        voiceCounts: work.voiceCounts.join(', '),
        prints: work.prints.join(', '),
        textAuthors: work.textAuthors.join(', '),
        completeEditions: work.completeEditions.join(', '),
        entryCount: work.entryCount,
      })),
    [],
  )

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Werkverzeichnis Orlando di Lasso
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {works.length} Werke, Datenstand vom {metaFile.generated}. Der vollständige
        Bestand samt Herkunftsnachweis liegt in{' '}
        <Link href="https://github.com/nikilachniki/lassoDBData" target="_blank" rel="noopener">
          lassoDBData
        </Link>
        .
      </Typography>
      <Box sx={{ height: 720 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          slots={{ toolbar: GridToolbar }}
          slotProps={{ toolbar: { showQuickFilter: true } }}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: 'lv', sort: 'asc' }] },
          }}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  )
}

export default App
