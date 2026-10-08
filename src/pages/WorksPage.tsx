import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowParams,
  type GridSortModel,
} from '@mui/x-data-grid'
import { SiglumChip } from '../components/SiglumChip.tsx'
import { AuthorOrSourceText } from '../helpers.tsx'
import type { Work } from '../types.ts'
import {
  getManuscripts,
  getParts,
  getPerson,
  isBaseWork,
  mainTitle,
  textAuthorLabels,
  workSlug,
  works,
  type TextAuthorLabel,
} from '../worksData.ts'
import { collectDistinct, filterWorks, hasActiveFilters, type WorksFilters } from '../search/filterWorks.ts'
import { Highlight } from '../search/Highlight.tsx'
import { WorksGridToolbar } from '../search/WorksGridToolbar.tsx'
import { WorksSearchBar } from '../search/WorksSearchBar.tsx'

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
  textAuthors: TextAuthorLabel[]
  textSources: string[]
  completeEditions: string
  genres: string
  languages: string
  siglaText: string
  sigla: Siglum[]
  isPart: boolean
  // Treffer der aktiven Suche/Filter. Basiswerke, die nur als Rahmen fuer
  // einen passenden Teil erscheinen, sind keine Treffer.
  isMatch: boolean
  // Gesamtwerk eines Teils (@id), fuer Gesamtwerke null
  isPartOf: string | null
  // Anzahl der in der Tabelle zugeordneten Teile (nur Basiswerke)
  partCount: number
  expanded: boolean
}

// LV-Nummern sind keine reinen Zahlen, etwa "100-2" oder "100 (I)". Ein
// simpler String-Vergleich sortiert "10" vor "2"; der numerische Vergleich
// von Intl behandelt die eingebetteten Zahlen dagegen als Zahlen.
const lvComparator = (a: string, b: string) => a.localeCompare(b, 'de', { numeric: true })

// Von Hand auf- oder zugeklappte Gruppen, je Gesamtwerk (@id), siehe WorksPage.
const expandedOverrides = new Map<string, boolean>()

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
  const authors = textAuthorLabels(work)
    .map((author) => author.name)
    .join(', ')
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

// Sigel in der Uebersichtsspalte, siehe SiglumChip.
const VISIBLE_SIGLA = 2
const SIGLUM_CHIP_MAX_WIDTH = 76

// Die ersten Sigel als Chips, weitere hinter einem "+N"-Chip mit Pfeil, der
// ein Popover mit allen Sigeln oeffnet. stopPropagation verhindert, dass der
// Klick die Zeilennavigation der DataGrid zur Detailseite ausloest.
function SiglaCell({ sigla }: { sigla: Siglum[] }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  if (sigla.length === 0) {
    return null
  }
  const hidden = sigla.length - VISIBLE_SIGLA
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', height: '100%', minWidth: 0, overflow: 'hidden' }}>
      {sigla.slice(0, VISIBLE_SIGLA).map((entry) => (
        <SiglumChip key={entry.siglum} siglum={entry.siglum} link={entry.link} maxWidth={SIGLUM_CHIP_MAX_WIDTH} />
      ))}
      {hidden > 0 && (
        <>
          <Chip
            size="small"
            variant="outlined"
            clickable
            label={`+${hidden}`}
            icon={<ExpandMoreIcon />}
            sx={{ flexShrink: 0, '& .MuiChip-icon': { order: 2, mr: 0.5, ml: -0.5 } }}
            onClick={(event) => {
              event.stopPropagation()
              setAnchor(event.currentTarget)
            }}
          />
          <Popover
            open={Boolean(anchor)}
            anchorEl={anchor}
            onClose={(event: object) => {
              ;(event as Event).stopPropagation?.()
              setAnchor(null)
            }}
            onClick={(event) => event.stopPropagation()}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <Stack direction="row" spacing={0.5} useFlexGap sx={{ p: 1.5, maxWidth: 320, flexWrap: 'wrap' }}>
              {sigla.map((entry) => (
                <SiglumChip key={entry.siglum} siglum={entry.siglum} link={entry.link} maxWidth={SIGLUM_CHIP_MAX_WIDTH} />
              ))}
            </Stack>
          </Popover>
        </>
      )}
    </Stack>
  )
}

function createColumns(onToggle: (workId: string) => void, query: string): GridColDef<Row>[] {
  return [
  {
    field: 'lv',
    headerName: 'LV',
    width: 140,
    sortComparator: lvComparator,
    renderCell: (params: GridRenderCellParams<Row>) => {
      const row = params.row
      return (
        <Stack direction="row" sx={{ alignItems: 'center', height: '100%', pl: row.isPart ? 3.5 : 0 }}>
          {row.isPart ? (
            <SubdirectoryArrowRightIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.disabled' }} />
          ) : row.partCount > 0 ? (
            <IconButton
              size="small"
              aria-label={row.expanded ? 'Teile einklappen' : 'Teile ausklappen'}
              aria-expanded={row.expanded}
              onClick={(event) => {
                event.stopPropagation()
                onToggle(row.id)
              }}
              sx={{ mr: 0.5, border: 1, borderColor: 'text.secondary', color: 'text.primary', width: 26, height: 26 }}
            >
              <ExpandMoreIcon
                fontSize="small"
                sx={{ transform: row.expanded ? 'none' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
              />
            </IconButton>
          ) : (
            <span style={{ width: 32, flexShrink: 0 }} />
          )}
          <span>
            <Highlight text={row.lv} query={query} />
          </span>
        </Stack>
      )
    },
  },
  {
    field: 'title',
    headerName: 'Titel',
    flex: 1,
    minWidth: 220,
    renderCell: (params: GridRenderCellParams<Row>) => <Highlight text={params.row.title} query={query} />,
  },
  { field: 'voiceCounts', headerName: 'Stimmen', width: 90 },
  {
    field: 'prints',
    headerName: 'Drucke',
    width: 110,
    renderCell: (params: GridRenderCellParams<Row>) => <Highlight text={params.row.prints} query={query} />,
  },
  {
    field: 'textAuthorOrSource',
    headerName: 'Textdichter / Textprovenienz',
    width: 260,
    // Der Zellwert (textAuthorOrSource) bleibt die reine Zeichenkette, damit
    // Sortierung, Filter und CSV/Druck-Export unveraendert darauf arbeiten;
    // nur die Darstellung zeigt zusaetzlich die GND/VIAF-Badges an, siehe
    // AuthorOrSourceText.
    renderCell: (params: GridRenderCellParams<Row>) => (
      <AuthorOrSourceText authors={params.row.textAuthors} sources={params.row.textSources} highlight={query} />
    ),
  },
  {
    field: 'completeEditions',
    headerName: 'Gesamtausgabe',
    width: 130,
    renderCell: (params: GridRenderCellParams<Row>) => (
      <Highlight text={params.row.completeEditions} query={query} />
    ),
  },
  {
    field: 'genres',
    headerName: 'Gattung',
    width: 120,
    renderCell: (params: GridRenderCellParams<Row>) => <Highlight text={params.row.genres} query={query} />,
  },
  {
    field: 'languages',
    headerName: 'Sprache',
    width: 100,
    renderCell: (params: GridRenderCellParams<Row>) => <Highlight text={params.row.languages} query={query} />,
  },
  {
    field: 'siglaText',
    headerName: 'Handschriften',
    width: 200,
    renderCell: (params: GridRenderCellParams<Row>) => <SiglaCell sigla={params.row.sigla} />,
  },
  ]
}

interface WorksPageProps {
  filters: WorksFilters
  onFiltersChange: (filters: WorksFilters) => void
}

export function WorksPage({ filters, onFiltersChange }: WorksPageProps) {
  const navigate = useNavigate()

  const authorOptions = useMemo(
    () =>
      collectDistinct(works, (work) => work.textAuthors).sort((a, b) =>
        (getPerson(a)?.preferredName ?? a).localeCompare(getPerson(b)?.preferredName ?? b, 'de'),
      ),
    [],
  )
  const voiceCountOptions = useMemo(
    () => collectDistinct(works, (work) => work.voiceCounts).sort((a, b) => a - b),
    [],
  )

  const genreOptions = useMemo(
    () => collectDistinct(works, (work) => work.genres).sort((a, b) => a.localeCompare(b, 'de')),
    [],
  )
  const languageOptions = useMemo(
    () => collectDistinct(works, (work) => work.languages).sort((a, b) => a.localeCompare(b, 'de')),
    [],
  )

  const filteredWorks = useMemo(() => filterWorks(works, filters), [filters])

  const filtering = hasActiveFilters(filters)

  // Von Hand auf- oder zugeklappte Gruppen (Gesamtwerk -> offen?). Ohne Eintrag
  // gilt: bei aktiver Suche offen, sonst zu. Der Zustand liegt zusaetzlich auf
  // Modulebene, weil die Seite beim Wechsel zur Detailansicht und zurueck neu
  // gemountet wird und die Gruppen sonst jedes Mal zuklappen wuerden.
  const [overrides, setOverrides] = useState(() => new Map(expandedOverrides))
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'lv', sort: 'asc' }])

  const rows = useMemo<Row[]>(() => {
    const matchedIds = new Set(filteredWorks.map((work) => work['@id']))
    const matchedParts = new Map<string, Work[]>()
    for (const work of filteredWorks) {
      if (work.isPartOf) {
        matchedParts.set(work.isPartOf, [...(matchedParts.get(work.isPartOf) ?? []), work])
      }
    }

    const toRow = (work: Work, extra: Partial<Row>): Row => {
      const sigla = manuscriptSigla(work)
      return {
        id: work['@id'],
        lv: formatLvColumn(work),
        title: mainTitle(work),
        voiceCounts: work.voiceCounts.join(', '),
        prints: work.prints.join(', '),
        textAuthorOrSource: formatTextAuthorOrSource(work),
        textAuthors: textAuthorLabels(work),
        textSources: work.textSources,
        completeEditions: work.completeEditions.join(', '),
        genres: work.genres.join(', '),
        languages: work.languages.join(', '),
        siglaText: sigla.map((entry) => entry.siglum).join(', '),
        sigla,
        isPart: !isBaseWork(work),
        isMatch: filtering && matchedIds.has(work['@id']),
        isPartOf: work.isPartOf,
        partCount: 0,
        expanded: false,
        ...extra,
      }
    }

    // Teile erscheinen nur unter ihrem Basiswerk. Passt bei einer Suche nur ein
    // Teil, wird sein Basiswerk als Kontext mit angezeigt.
    const baseRows = works
      .filter(
        (work) =>
          isBaseWork(work) && (matchedIds.has(work['@id']) || matchedParts.has(work['@id'])),
      )
      .map((work) => {
        const parts = filtering ? (matchedParts.get(work['@id']) ?? []) : getParts(work)
        const expanded = overrides.get(work['@id']) ?? (filtering && parts.length > 0)
        const row = toRow(work, {
          partCount: parts.length,
          expanded,
        })
        return { parts, expanded, row }
      })

    // Sortiert wird nur auf Ebene der Basiswerke (sortingMode="server"), damit
    // die Teile immer direkt unter ihrem Basiswerk stehen bleiben.
    const sort = sortModel[0]
    if (sort?.sort) {
      const direction = sort.sort === 'desc' ? -1 : 1
      const field = sort.field as keyof Row
      baseRows.sort((a, b) => direction * lvComparator(String(a.row[field] ?? ''), String(b.row[field] ?? '')))
    }

    return baseRows.flatMap(({ parts, expanded, row }) => [
      row,
      // Teile stehen bereits in Katalogreihenfolge (hasPart bzw. works).
      ...(expanded ? parts.map((part) => toRow(part, {})) : []),
    ])
  }, [filteredWorks, filtering, overrides, sortModel])

  const toggleGroup = useCallback(
    (workId: string) => {
      const row = rows.find((candidate) => candidate.id === workId)
      setOverrides((current) => {
        const next = new Map(current)
        next.set(workId, !(row?.expanded ?? false))
        expandedOverrides.clear()
        next.forEach((value, key) => expandedOverrides.set(key, value))
        return next
      })
    },
    [rows],
  )

  const columns = useMemo(() => createColumns(toggleGroup, filters.query), [toggleGroup, filters.query])

  // Teile haben keine eigene Detailseite: ein Klick fuehrt zum Basiswerk, das
  // den Teil in seiner Teile-Tabelle hervorhebt und dorthin scrollt.
  const handleRowClick = (params: GridRowParams<Row>) => {
    const row = params.row
    if (row.isPartOf) {
      navigate(`/werk/${workSlug({ '@id': row.isPartOf })}`, { state: { focusPart: row.id } })
      return
    }
    navigate(`/werk/${workSlug({ '@id': row.id })}`)
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
        genreOptions={genreOptions}
        languageOptions={languageOptions}
        resultCount={filteredWorks.length}
        totalCount={works.length}
      />
      <Paper variant="outlined" sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          showToolbar
          slots={{ toolbar: WorksGridToolbar }}
          slotProps={{ toolbar: { works: filteredWorks } }}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          initialState={{ pagination: { paginationModel: { pageSize: 100 } } }}
          pageSizeOptions={[25, 50, 100]}
          density="compact"
          disableRowSelectionOnClick
          getRowClassName={(params) => (params.row.isMatch ? 'lasso-row-match' : '')}
          onRowClick={handleRowClick}
          sx={{
            flex: 1,
            border: 0,
            '& .MuiTablePagination-toolbar': { minHeight: 40 },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              margin: 0,
            },
            // Alle Zeilen sind klickbar (Teile fuehren zu ihrem Basiswerk). Die
            // Darstellung traegt zwei Informationen, je ueber ein eigenes Mittel:
            //   - Struktur (Teil eines Werks): Einrueckung und Pfeil in der LV-Spalte
            //   - Suche: gelber Balken am linken Rand der Trefferzeilen, dazu der
            //     gelb markierte Suchbegriff im Text (siehe Highlight). Basiswerke,
            //     die nur als Rahmen fuer einen passenden Teil erscheinen, bleiben
            //     ohne Balken.
            // Der Balken ist ein innerer Schatten statt eines Rahmens, damit die
            // Zeilen nicht um dessen Breite verrutschen.
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .lasso-row-match': { boxShadow: (theme) => `inset 4px 0 0 ${theme.palette.highlight.bar}` },
            // Kein Fokusrahmen um einzelne Zellen: die Tabelle wird zeilenweise
            // bedient, ein Rahmen um die angeklickte Zelle wirkt wie eine
            // Hervorhebung dieser einen Zelle.
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none',
            },
          }}
        />
      </Paper>
    </Container>
  )
}
