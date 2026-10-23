import { useEffect, useRef, type ReactNode } from 'react'
import { Navigate, Link as RouterLink, useLocation, useParams } from 'react-router-dom'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { BackButton } from '../components/BackButton.tsx'
import { Fact } from '../components/Fact.tsx'
import { Section } from '../components/Section.tsx'
import { PrintChip } from '../components/PrintChip.tsx'
import { PrintLinks } from '../components/PrintLinks.tsx'
import { PrintRism, RismBadge } from '../components/PrintRism.tsx'
import { PrintTitlePage, TextWithPrintLinks } from '../components/PrintText.tsx'
import { SiglumChip } from '../components/SiglumChip.tsx'
import { authorOrSourceLabel, AuthorOrSourceText } from '../helpers.tsx'
import type { Expression, ManuscriptWitness, Work } from '../types.ts'
import {
  findRelatedParts,
  findWholeWork,
  findWorkByExpressionSlug,
  findWorkBySlug,
  formatCatalogNumber,
  getExpressions,
  getManuscripts,
  entryTextAuthorLabels,
  getSortedEntries,
  getWorkPrints,
  printRism,
  isBaseWork,
  mainTitle,
  textAuthorLabels,
  workSlug,
  type WorkInPrint,
} from '../worksData.ts'

const URL_PATTERN = /(https?:\/\/[^\s<>"]+)/g

function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, i) => {
        if (i % 2 === 0) {
          return part
        }
        // Satzzeichen am Ende gehören meist nicht zur URL
        const url = part.replace(/[.,;:!?)\]]+$/, '')
        const trailing = part.slice(url.length)
        return (
          <span key={i}>
            <Link href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </Link>
            {trailing}
          </span>
        )
      })}
    </>
  )
}

function partLabel(work: Work): string {
  if (work.lvPart) {
    return `Teil ${work.lvPart}`
  }
  return 'Basiswerk'
}

// focusId: der Teil, ueber den man aus der Werktabelle hierher gekommen ist.
// Teile haben keine eigene Detailseite, deshalb wird er hier markiert und in
// den sichtbaren Bereich gescrollt.
function RelatedPartsTable({ parts, focusId }: { parts: Work[]; focusId?: string }) {
  const focusRef = useRef<HTMLTableRowElement>(null)
  const authorOrSourceHeader = authorOrSourceLabel(
    parts.some((part) => part.textAuthors.length > 0),
    parts.some((part) => part.textSources.length > 0),
  )
  const hasGenres = parts.some((part) => part.genres.length > 0)
  const hasLanguages = parts.some((part) => part.languages.length > 0)

  useEffect(() => {
    focusRef.current?.scrollIntoView({ block: 'center' })
  }, [focusId])

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>LV</TableCell>
            <TableCell>Titel</TableCell>
            <TableCell>Stimmen</TableCell>
            <TableCell>Drucke</TableCell>
            <TableCell>{authorOrSourceHeader}</TableCell>
            <TableCell>Gesamtausgabe</TableCell>
            {hasGenres && <TableCell>Gattung</TableCell>}
            {hasLanguages && <TableCell>Sprache</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {parts.map((part) => (
            <TableRow
              key={part['@id']}
              selected={part['@id'] === focusId}
              ref={part['@id'] === focusId ? focusRef : undefined}
            >
              <TableCell>{part.lv}</TableCell>
              <TableCell>{mainTitle(part)}</TableCell>
              <TableCell>{part.voiceCounts.join(', ')}</TableCell>
              <TableCell>
                <PrintLinks sigla={part.prints} />
              </TableCell>
              <TableCell>
                <AuthorOrSourceText authors={textAuthorLabels(part)} sources={part.textSources} />
              </TableCell>
              <TableCell>{part.completeEditions.join(', ')}</TableCell>
              {hasGenres && <TableCell>{part.genres.join(', ')}</TableCell>}
              {hasLanguages && <TableCell>{part.languages.join(', ')}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// Die Fassungen (Expressions) eines Werks. "Teil" ist die roemische Ziffer
// aus der Quelle und bezeichnet den Teil des Werks, den die Fassung bringt.
function ExpressionsTable({ expressions }: { expressions: Expression[] }) {
  const authorOrSourceHeader = authorOrSourceLabel(
    expressions.some((expression) => expression.textAuthors.length > 0),
    expressions.some((expression) => expression.textSources.length > 0),
  )
  const hasGenres = expressions.some((expression) => expression.genres.length > 0)
  const hasLanguages = expressions.some((expression) => expression.languages.length > 0)

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Teil</TableCell>
            <TableCell>LV</TableCell>
            <TableCell>Titel</TableCell>
            <TableCell>Stimmen</TableCell>
            <TableCell>Druck</TableCell>
            <TableCell>{authorOrSourceHeader}</TableCell>
            <TableCell>Gesamtausgabe</TableCell>
            {hasGenres && <TableCell>Gattung</TableCell>}
            {hasLanguages && <TableCell>Sprache</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {expressions.map((expression) => (
            <TableRow key={expression['@id']}>
              <TableCell>{expression.pars}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{expression.lv}</TableCell>
              <TableCell>{mainTitle(expression)}</TableCell>
              <TableCell>{expression.voiceCounts.join(', ')}</TableCell>
              <TableCell>
                <PrintLinks sigla={expression.prints} />
              </TableCell>
              <TableCell>
                <AuthorOrSourceText authors={textAuthorLabels(expression)} sources={expression.textSources} />
              </TableCell>
              <TableCell>{expression.completeEditions.join(', ')}</TableCell>
              {hasGenres && <TableCell>{expression.genres.join(', ')}</TableCell>}
              {hasLanguages && <TableCell>{expression.languages.join(', ')}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// Kurzangabe in der geschlossenen Zeile eines Drucks: Beschreibung aus dem
// Druckeverzeichnis (etwa "Nachdruck von 1555-1", Sigel verlinkt) und Zusatz,
// bei Erstdrucken der Titel in der Schreibung des Drucks.
function WorkPrintSummary({ item }: { item: WorkInPrint }) {
  const rest = [item.note ?? '', item.entries[0]?.title ?? ''].filter(Boolean)
  return (
    <Typography variant="body2">
      {item.print?.description && <TextWithPrintLinks text={item.print.description} />}
      {item.print?.description && rest.length > 0 && ' · '}
      {rest.join(' · ')}
    </Typography>
  )
}

// Alle Drucke eines Werks, wie die Handschriften als aufklappbare Karten.
// Erstdrucke tragen die Angaben des LV-Katalogs (Titel in der Schreibung des
// Drucks, Stimmen, Textdichter ...), Nachdrucke nur die des Registers.
function PrintsAccordion({ items }: { items: WorkInPrint[] }) {
  return (
    <Stack spacing={1}>
      {items.map((item) => (
        <Accordion key={item.siglum} variant="outlined" disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
              <PrintChip siglum={item.siglum} firstPrint={item.entries.length > 0} sx={{ flexShrink: 0 }} />
              {item.print && <RismBadge print={item.print} />}
              <WorkPrintSummary item={item} />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {/* Breit zweispaltig wie auf der Druckseite: links die Angaben,
                rechts das Titelblatt; schmal untereinander. */}
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 2, md: 3 },
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: item.print?.title ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)' },
                alignItems: 'start',
              }}
            >
              <Stack spacing={1.5}>
                <Fact
                  label="Stimmbücher"
                  labelWidth={130}
                  value={item.print?.partbooks ?? ''}
                />
                <Fact label="Zusatz" labelWidth={130} value={item.note ?? ''} />
                <Fact
                  label="RISM"
                  labelWidth={130}
                  value={item.print && printRism(item.print) ? <PrintRism print={item.print} /> : ''}
                />
                {item.entries.map((entry) => {
                  // Die Werkangaben oben sind aus den Erstdrucken zusammengefasst;
                  // hier steht deshalb nur, was im Druck davon abweicht.
                  const work = item.work
                  const differs = <T,>(value: T | null, workValues: T[]) =>
                    value !== null && value !== '' && !(workValues.length === 1 && workValues[0] === value)
                  // Textdichter ueber die Person verglichen, nicht ueber die Schreibung
                  // ("Petrarca" im Druck, "Francesco Petrarca" am Werk)
                  const sameAuthor = entry.textAuthorPerson
                    ? !differs(entry.textAuthorPerson, work.textAuthors)
                    : !entry.textAuthor && !differs(entry.textSource, work.textSources)
                  const authors = sameAuthor ? [] : entryTextAuthorLabels(entry)
                  const sources = !sameAuthor && entry.textSource ? [entry.textSource] : []
                  const facts = [
                    { label: 'Titel im Druck', value: differs(entry.title, [mainTitle(work)]) ? entry.title : null },
                    { label: 'Stimmen', value: differs(entry.voices, work.voiceCounts) ? entry.voices : null },
                    {
                      label: authorOrSourceLabel(authors.length > 0, sources.length > 0),
                      value: authors.length + sources.length > 0 ? <AuthorOrSourceText authors={authors} sources={sources} /> : null,
                    },
                    { label: 'Gesamtausgabe', value: differs(entry.completeEdition, work.completeEditions) ? entry.completeEdition : null },
                    { label: 'Gattung', value: differs(entry.genre, work.genres) ? entry.genre : null },
                    { label: 'Sprache', value: differs(entry.language, work.languages) ? entry.language : null },
                    { label: 'Bemerkung', value: entry.note },
                  ].filter((fact) => fact.value !== null && fact.value !== '')
                  if (facts.length === 0) {
                    return null
                  }
                  return (
                    <Stack key={entry['@id']} spacing={1.5} sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
                        {entry.lv && entry.lv !== work.lv ? `Im Erstdruck abweichend, Fassung LV ${entry.lv}` : 'Im Erstdruck abweichend'}
                      </Typography>
                      {facts.map((fact) => (
                        <Fact key={fact.label} label={fact.label} labelWidth={130} value={fact.value} />
                      ))}
                    </Stack>
                  )
                })}
              </Stack>
              {item.print?.title && <PrintTitlePage title={item.print.title} />}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  )
}

// Kurzbeschreibung fuer die geschlossene Accordion-Zeile: Ort, Bibliothek
// und Signatur identifizieren eine Handschrift eindeutiger als ihr Titel,
// der oft mit dem des Werks uebereinstimmt.
function manuscriptSummary(manuscript: ManuscriptWitness): string {
  const parts = [manuscript.place, manuscript.library, manuscript.shelfmark].filter(
    (part): part is string => Boolean(part),
  )
  if (parts.length > 0) {
    return parts.join(', ')
  }
  return manuscript.title ?? `Handschrift ${manuscript.id}`
}

// Das RISM-Sigel als Fact-Wert: verlinkt auf den Online-Katalog, wenn die
// Quelle dafuer einen Link traegt (Spalte "Link", meist RISM, vereinzelt ein
// anderer Bibliothekskatalog), sonst schlichter Text. Fehlt umgekehrt das
// Sigel selbst bei vorhandenem Link (7 von 8939 Zeugnissen), dient "Katalog"
// als Linktext, damit der Verweis nicht verloren geht.
function rismValue(manuscript: ManuscriptWitness): ReactNode {
  if (!manuscript.rismSiglum && !manuscript.link) {
    return ''
  }
  if (!manuscript.link) {
    return manuscript.rismSiglum
  }
  return (
    <Link href={manuscript.link} target="_blank" rel="noopener noreferrer">
      {manuscript.rismSiglum ?? 'Katalog'}
    </Link>
  )
}

// Je Handschrift ein ausklappbares Panel statt einer Tabellenzeile, im
// gleichen Fact-Stil wie der Werkeintrag oben auf der Seite. Handschriften
// tragen mehr uneinheitliche, teils lange Angaben (Quellenart, Bemerkung)
// als die gedruckten Fassungen, dafuer aber weniger Datensaetze pro Werk;
// das macht eine dichte Tabelle hier weniger passend als aufklappbare
// Detailkarten.
function ManuscriptsAccordion({ manuscripts }: { manuscripts: ManuscriptWitness[] }) {
  return (
    <Stack spacing={1}>
      {manuscripts.map((manuscript) => (
        <Accordion key={manuscript['@id']} variant="outlined" disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
              {manuscript.rismSiglum && (
                <SiglumChip
                  siglum={manuscript.rismSiglum}
                  link={manuscript.link}
                  maxWidth={96}
                  sx={{ flexShrink: 0 }}
                />
              )}
              <Typography variant="body2">{manuscriptSummary(manuscript)}</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              <Fact label="RISM-Sigel" value={rismValue(manuscript)} />
              <Fact label="Ort" value={manuscript.place ?? ''} />
              <Fact label="Bibliothek" value={manuscript.library ?? ''} />
              <Fact label="Signatur" value={manuscript.shelfmark ?? ''} />
              <Fact label="Weitere Signatur" value={manuscript.shelfmarkAlt ?? ''} />
              <Fact label="Titel" value={manuscript.title ?? ''} />
              <Fact label="Stimmen" value={manuscript.voices ?? ''} />
              <Fact label="Datierung" value={manuscript.dating ?? ''} />
              <Fact label="Provenienz" value={manuscript.provenance ?? ''} />
              <Fact label="Quellenart" value={manuscript.sourceDescription ?? ''} />
              <Fact label="Bemerkung (Stück)" value={manuscript.note ?? ''} />
              <Fact label="Bemerkung (Quelle)" value={manuscript.sourceNote ?? ''} />
              <Fact label="Literatur" value={manuscript.literature ? <Linkified text={manuscript.literature} /> : ''} />
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  )
}

export function WorkDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const focusPart = (useLocation().state as { focusPart?: string } | null)?.focusPart
  const work = slug ? findWorkBySlug(slug) : undefined

  // Alte Adresse einer Fassung (z.B. /werk/74-IV): zum zugehoerigen Werk.
  const expressionWork = !work && slug ? findWorkByExpressionSlug(slug) : undefined
  if (expressionWork) {
    return <Navigate to={`/werk/${workSlug(expressionWork)}`} replace />
  }

  if (!work) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Werk nicht gefunden.</Alert>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          Zurück zur Übersicht
        </Button>
      </Container>
    )
  }

  const baseWork = findWholeWork(work)
  const relatedParts = findRelatedParts(work)
  const entries = getSortedEntries(work)
  const firstEntry = entries[0]
  const workPrints = getWorkPrints(work)
  const manuscriptWitnesses = getManuscripts(work)
  const expressions = getExpressions(work)

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 }, overflowY: 'auto', flex: 1, minHeight: 0 }}>
      <BackButton overviewPath="/" />

      {baseWork && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Dies ist {partLabel(work).toLowerCase()} von Werk LV {baseWork.lv}.{' '}
          <Link component={RouterLink} to={`/werk/${workSlug(baseWork)}`}>
            Zum Basiswerk
          </Link>
          .
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <Chip label={formatCatalogNumber(work)} size="small" sx={{ fontWeight: 700 }} />
          {!isBaseWork(work) && <Chip label={partLabel(work)} size="small" variant="outlined" />}
        </Stack>
        <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
          {mainTitle(work)}
        </Typography>

        {/* Wie auf der Druckseite: breit in zwei Spalten, schmal untereinander.
            Die weiteren Titel koennen lang sein und laufen ueber beide Spalten. */}
        <Box
          sx={{
            display: 'grid',
            columnGap: 4,
            rowGap: 1.5,
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          {work.variantTitles.length > 0 && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Fact label="Weitere Titel" labelWidth={130} value={work.variantTitles.join(' / ')} />
            </Box>
          )}
          <Fact label="Gattung" labelWidth={130} value={work.genres.join(', ')} />
          <Fact label="Sprache" labelWidth={130} value={work.languages.join(', ')} />
          <Fact label="Stimmen" labelWidth={130} value={work.voiceCounts.join(', ')} />
          <Fact
            label="Erstdruck"
            labelWidth={130}
            value={firstEntry?.firstPrint ? <PrintLinks sigla={[firstEntry.firstPrint]} /> : ''}
          />
          <Fact
            label={authorOrSourceLabel(work.textAuthors.length > 0, work.textSources.length > 0)}
            labelWidth={130}
            value={<AuthorOrSourceText authors={textAuthorLabels(work)} sources={work.textSources} />}
          />
          <Fact label="Gesamtausgabe" labelWidth={130} value={work.completeEditions.join(', ')} />
        </Box>

        <Box sx={{ mt: 3 }}>
          {relatedParts.length > 0 && (
            // Kommt man ueber einen Teil aus der Werktabelle, ist der Abschnitt
            // offen, damit der markierte Teil sichtbar ist.
            <Section
              title={baseWork ? 'Weitere Teile dieses Werks' : 'Teile dieses Werks'}
              count={relatedParts.length}
              defaultExpanded={relatedParts.some((part) => part['@id'] === focusPart)}
            >
              <Box sx={{ overflowX: 'auto' }}>
                <RelatedPartsTable parts={relatedParts} focusId={focusPart} />
              </Box>
            </Section>
          )}

          {workPrints.length > 0 && (
            <Section title="Drucke" count={workPrints.length}>
              {baseWork && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Das Druckregister führt Teile nicht einzeln. Hier steht nur der Erstdruck dieses
                  Teils, alle Drucke des Gesamtwerks stehen beim Basiswerk.
                </Typography>
              )}
              <PrintsAccordion items={workPrints} />
            </Section>
          )}

          {manuscriptWitnesses.length > 0 && (
            <Section title="Handschriftliche Überlieferung" count={manuscriptWitnesses.length}>
              <ManuscriptsAccordion manuscripts={manuscriptWitnesses} />
            </Section>
          )}

          {expressions.length > 0 && (
            <Section title="Fassungen" count={expressions.length}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Einzelne Teile dieses Werks in abweichender Gestalt, meist mit anderer Stimmenzahl in
                einem anderen Druck.
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <ExpressionsTable expressions={expressions} />
              </Box>
            </Section>
          )}
        </Box>
      </Paper>
    </Container>
  )
}
