import { useState, type ReactNode } from 'react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import AddIcon from '@mui/icons-material/Add'
import ClearIcon from '@mui/icons-material/Clear'
import CloseIcon from '@mui/icons-material/Close'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SearchIcon from '@mui/icons-material/Search'

// Ein gezielter Suchparameter der Filterleiste. Ein Parameter kann mehrere
// Filterwerte umfassen (etwa Jahr von/bis), deshalb pruefen und leeren die
// Felddefinitionen selbst, statt dass die Leiste den Wertetyp kennen muss.
export interface FilterField<F> {
  key: string
  label: string
  isActive: (filters: F) => boolean
  clear: (filters: F) => F
  render: (filters: F, onChange: (filters: F) => void) => ReactNode
}

interface FilterBarProps<F extends { query: string }> {
  filters: F
  onFiltersChange: (filters: F) => void
  defaultFilters: F
  fields: FilterField<F>[]
  placeholder: string
}

// Freie Suche plus gezielte Parameter, die ueber "Filter hinzufuegen"
// zugeschaltet werden. Gemeinsam fuer Werke und Drucke.
export function FilterBar<F extends { query: string }>({
  filters,
  onFiltersChange,
  defaultFilters,
  fields,
  placeholder,
}: FilterBarProps<F>) {
  const [activeKeys, setActiveKeys] = useState<string[]>(() =>
    fields.filter((field) => field.isActive(filters)).map((field) => field.key),
  )
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null)
  const activeFields = activeKeys
    .map((key) => fields.find((field) => field.key === key))
    .filter((field): field is FilterField<F> => field !== undefined)
  const availableFields = fields.filter((field) => !activeKeys.includes(field.key))
  const filtersPresent = filters.query.trim() !== '' || fields.some((field) => field.isActive(filters))

  const addField = (key: string) => {
    setActiveKeys((current) => [...current, key])
    setAddMenuAnchor(null)
  }

  const removeField = (field: FilterField<F>) => {
    setActiveKeys((current) => current.filter((key) => key !== field.key))
    onFiltersChange(field.clear(filters))
  }

  const handleReset = () => {
    setActiveKeys([])
    onFiltersChange(defaultFilters)
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, flexShrink: 0 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder={placeholder}
            value={filters.query}
            onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: filters.query && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Suche löschen"
                      onClick={() => onFiltersChange({ ...filters, query: '' })}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                bgcolor: 'background.default',
              },
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          {activeFields.map((field) => (
            <Stack
              key={field.key}
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                pl: 1,
                pr: 0.5,
                py: 0.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: 999,
              }}
            >
              <Chip label={field.label} size="small" sx={{ fontWeight: 600 }} />
              {field.render(filters, onFiltersChange)}
              <IconButton
                size="small"
                aria-label={`${field.label}-Filter entfernen`}
                onClick={() => removeField(field)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}

          {availableFields.length > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={(event) => setAddMenuAnchor(event.currentTarget)}
              sx={{ borderStyle: 'dashed', borderRadius: 999 }}
            >
              Filter hinzufügen
            </Button>
          )}
          <Menu anchorEl={addMenuAnchor} open={Boolean(addMenuAnchor)} onClose={() => setAddMenuAnchor(null)}>
            {availableFields.map((field) => (
              <MenuItem key={field.key} onClick={() => addField(field.key)}>
                {field.label}
              </MenuItem>
            ))}
          </Menu>

          {filtersPresent && (
            <Button size="small" color="inherit" startIcon={<RestartAltIcon />} onClick={handleReset}>
              Zurücksetzen
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
