import { useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
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
import { defaultWorksFilters, hasActiveFilters, type WorksFilters } from './filterWorks'

type FilterFieldKey = 'textAuthors' | 'textSources' | 'voiceCounts' | 'prints' | 'completeEditions'

const FILTER_FIELD_ORDER: FilterFieldKey[] = [
  'textAuthors',
  'textSources',
  'voiceCounts',
  'prints',
  'completeEditions',
]

const FILTER_FIELD_LABELS: Record<FilterFieldKey, string> = {
  textAuthors: 'Textdichter',
  textSources: 'Textprovenienz',
  voiceCounts: 'Stimmen',
  prints: 'Drucke',
  completeEditions: 'Gesamtausgabe',
}

const TEXT_FIELD_KEYS: FilterFieldKey[] = ['textSources', 'prints', 'completeEditions']

function emptyValueFor(field: FilterFieldKey): WorksFilters[FilterFieldKey] {
  return TEXT_FIELD_KEYS.includes(field) ? '' : []
}

function isFieldActive(filters: WorksFilters, field: FilterFieldKey): boolean {
  const value = filters[field]
  return Array.isArray(value) ? value.length > 0 : value.trim() !== ''
}

interface WorksSearchBarProps {
  filters: WorksFilters
  onFiltersChange: (filters: WorksFilters) => void
  authorOptions: string[]
  voiceCountOptions: number[]
  resultCount: number
  totalCount: number
}

export function WorksSearchBar({
  filters,
  onFiltersChange,
  authorOptions,
  voiceCountOptions,
}: WorksSearchBarProps) {
  const [activeFields, setActiveFields] = useState<FilterFieldKey[]>(() =>
    FILTER_FIELD_ORDER.filter((field) => isFieldActive(filters, field)),
  )
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null)
  const activeFiltersPresent = hasActiveFilters(filters)
  const availableFields = FILTER_FIELD_ORDER.filter((field) => !activeFields.includes(field))

  const setFilter = <K extends keyof WorksFilters>(key: K, value: WorksFilters[K]) =>
    onFiltersChange({ ...filters, [key]: value })

  const addField = (field: FilterFieldKey) => {
    setActiveFields((current) => [...current, field])
    setAddMenuAnchor(null)
  }

  const removeField = (field: FilterFieldKey) => {
    setActiveFields((current) => current.filter((f) => f !== field))
    setFilter(field, emptyValueFor(field))
  }

  const handleReset = () => {
    setActiveFields([])
    onFiltersChange(defaultWorksFilters)
  }

  const renderFieldControl = (field: FilterFieldKey) => {
    if (field === 'textAuthors') {
      return (
        <Autocomplete
          multiple
          size="small"
          options={authorOptions}
          value={filters.textAuthors}
          onChange={(_, value) => setFilter('textAuthors', value)}
          renderInput={(params) => <TextField {...params} placeholder="Alle" />}
          sx={{ minWidth: 240 }}
        />
      )
    }
    if (field === 'voiceCounts') {
      return (
        <Autocomplete
          multiple
          size="small"
          options={voiceCountOptions}
          getOptionLabel={(option) => String(option)}
          value={filters.voiceCounts}
          onChange={(_, value) => setFilter('voiceCounts', value)}
          renderInput={(params) => <TextField {...params} placeholder="Alle" />}
          sx={{ minWidth: 200 }}
        />
      )
    }
    if (field === 'textSources') {
      return (
        <TextField
          size="small"
          placeholder="z. B. Ps 6"
          value={filters.textSources}
          onChange={(event) => setFilter('textSources', event.target.value)}
          sx={{ minWidth: 180 }}
        />
      )
    }
    if (field === 'prints') {
      return (
        <TextField
          size="small"
          placeholder="z. B. 1555"
          value={filters.prints}
          onChange={(event) => setFilter('prints', event.target.value)}
          sx={{ minWidth: 160 }}
        />
      )
    }
    return (
      <TextField
        size="small"
        placeholder="z. B. GA XIX"
        value={filters.completeEditions}
        onChange={(event) => setFilter('completeEditions', event.target.value)}
        sx={{ minWidth: 180 }}
      />
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, flexShrink: 0 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Werke durchsuchen – Titel, LV-Nummer, Textdichter, Drucke, Gesamtausgabe …"
            value={filters.query}
            onChange={(event) => setFilter('query', event.target.value)}
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
                      onClick={() => setFilter('query', '')}
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
              key={field}
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
              <Chip label={FILTER_FIELD_LABELS[field]} size="small" sx={{ fontWeight: 600 }} />
              {renderFieldControl(field)}
              <IconButton
                size="small"
                aria-label={`${FILTER_FIELD_LABELS[field]}-Filter entfernen`}
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
              <MenuItem key={field} onClick={() => addField(field)}>
                {FILTER_FIELD_LABELS[field]}
              </MenuItem>
            ))}
          </Menu>

          {activeFiltersPresent && (
            <Button size="small" color="inherit" startIcon={<RestartAltIcon />} onClick={handleReset}>
              Zurücksetzen
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
