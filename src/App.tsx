import { useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { InfoDialog } from './InfoDialog'
import { WorksPage } from './WorksPage'
import { WorkDetailPage } from './WorkDetailPage'
import { defaultWorksFilters, type WorksFilters } from './search/filterWorks'

function App() {
  const [infoOpen, setInfoOpen] = useState(false)
  // Lebt hier statt in WorksPage, damit die Sucheingaben erhalten bleiben,
  // wenn man in eine Werk-Detailseite wechselt und per "Zurück" wieder
  // zurückkommt. WorksPage haengt an der Route "/" und wird beim Wechsel
  // zu "/werk/:slug" und zurueck jedes Mal neu gemountet; ein dort lokaler
  // useState wuerde bei jedem Rueckweg auf die Ausgangswerte zurueckfallen.
  const [filters, setFilters] = useState<WorksFilters>(defaultWorksFilters)

  return (
    <HashRouter>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <AppBar sx={{ flexShrink: 0 }}>
          <Toolbar sx={{ gap: 2, py: 1 }}>
            <Link
              href="https://gfbm-online.de"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'inline-flex', flexShrink: 0 }}
            >
              <Box
                component="img"
                src={`${import.meta.env.BASE_URL}gfbm-lion.png`}
                alt="Logo der Gesellschaft für Bayerische Musikgeschichte e. V."
                sx={{ height: { xs: 40, sm: 48 }, width: 'auto' }}
              />
            </Link>
            <Divider orientation="vertical" flexItem sx={{ borderColor: 'currentColor', opacity: 0.2 }} />
            <Typography variant="h6" component="h1" sx={{ fontWeight: 700, lineHeight: 1.2, flexGrow: 1 }}>
              Orlando di Lasso | Werke
            </Typography>
            <Tooltip title="Informationen zum Projekt">
              <IconButton
                color="inherit"
                aria-label="Informationen zum Projekt"
                onClick={() => setInfoOpen(true)}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
            <InfoDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
          </Toolbar>
        </AppBar>

        <Routes>
          <Route path="/" element={<WorksPage filters={filters} onFiltersChange={setFilters} />} />
          <Route path="/werk/:slug" element={<WorkDetailPage />} />
        </Routes>
      </Box>
    </HashRouter>
  )
}

export default App
