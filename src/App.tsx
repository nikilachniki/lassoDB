import { useMemo } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar>
        <Toolbar sx={{ gap: 2, py: 1 }}>
          <Link
            href="https://gfbm-online.de"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'inline-flex', flexShrink: 0 }}
          >
            <Box
              component="img"
              src="/gfbm-lion.png"
              alt="Logo der Gesellschaft für Bayerische Musikgeschichte e. V."
              sx={{ height: { xs: 40, sm: 48 }, width: 'auto' }}
            />
          </Link>
          <Divider orientation="vertical" flexItem sx={{ borderColor: 'currentColor', opacity: 0.2 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              component="p"
              sx={{ lineHeight: 1.2, color: 'text.secondary', letterSpacing: 0.5 }}
            >
              Gesellschaft für Bayerische Musikgeschichte e. V.
            </Typography>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Werkverzeichnis Orlando di Lasso
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {works.length} Werke, Datenstand vom {metaFile.generated}. Der vollständige Bestand
          samt Herkunftsnachweis liegt in{' '}
          <Link
            href="https://github.com/nikilachniki/lassoDBData"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}
          >
            lassoDBData
            <OpenInNewIcon sx={{ fontSize: '0.9em' }} />
          </Link>
          .
        </Typography>
        <Paper variant="outlined" sx={{ height: 720, p: 1 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            showToolbar
            slots={{ toolbar: GridToolbar }}
            slotProps={{ toolbar: { showQuickFilter: true } }}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: { sortModel: [{ field: 'lv', sort: 'asc' }] },
            }}
            pageSizeOptions={[25, 50, 100]}
            disableRowSelectionOnClick
          />
        </Paper>
      </Container>
    </Box>
  )
}

export default App
