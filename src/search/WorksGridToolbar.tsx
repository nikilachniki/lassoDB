import MenuItem from '@mui/material/MenuItem'
import {
  GridCsvExportMenuItem,
  GridPrintExportMenuItem,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExportContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid'
import type { Work } from '../types'

declare module '@mui/x-data-grid' {
  interface ToolbarPropsOverrides {
    works: Work[]
  }
}

// Der JSON-Export liefert bewusst die rohen, ungekürzten Work-Objekte (statt der
// für die Tabelle aufbereiteten Zeilen), damit der Export verlustfrei und mit den
// Rohdaten aus lassoDBData zitierfähig bleibt.
function downloadWorksAsJson(works: Work[]) {
  const blob = new Blob([JSON.stringify(works, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'lasso-werke.json'
  link.click()
  URL.revokeObjectURL(url)
}

interface GridJsonExportMenuItemProps {
  works: Work[]
  hideMenu?: () => void
}

function GridJsonExportMenuItem({ works, hideMenu }: GridJsonExportMenuItemProps) {
  return (
    <MenuItem
      onClick={() => {
        downloadWorksAsJson(works)
        hideMenu?.()
      }}
    >
      JSON exportieren
    </MenuItem>
  )
}

export interface WorksGridToolbarProps {
  works: Work[]
}

export function WorksGridToolbar({ works }: WorksGridToolbarProps) {
  return (
    <GridToolbarContainer sx={{ justifyContent: 'flex-start' }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarExportContainer>
        <GridCsvExportMenuItem />
        <GridPrintExportMenuItem />
        <GridJsonExportMenuItem works={works} />
      </GridToolbarExportContainer>
    </GridToolbarContainer>
  )
}
