import entriesFile from './data/entries.json'
import expressionsFile from './data/expressions.json'
import manuscriptsFile from './data/manuscripts.json'
import personsFile from './data/persons.json'
import printsFile from './data/prints.json'
import worksFile from './data/works.json'
import type {
  CatalogueEntry,
  EntriesFile,
  Expression,
  ExpressionsFile,
  ManuscriptsFile,
  ManuscriptWitness,
  Person,
  PersonsFile,
  Print,
  PrintsFile,
  Work,
  WorksFile,
} from './types'

// Die JSON-Importe sind zur Buildzeit eingebunden, siehe scripts/sync-data.mjs.
// Es gibt keinen Server und keine Laufzeitabfrage, der gesamte Bestand wird clientseitig durchsucht und gefiltert.
export const works = (worksFile as WorksFile).items
const entries = (entriesFile as EntriesFile).items
const manuscripts = (manuscriptsFile as ManuscriptsFile).items
const persons = (personsFile as PersonsFile).items
const expressions = (expressionsFile as ExpressionsFile).items
export const prints = (printsFile as PrintsFile).items

// Ein Werk verweist per @id-Liste auf seine Eintraege (je ein Eintrag pro
// Druck, in dem es erschienen ist) und auf seine Handschriften-Zeugnisse.
// Einmal als Map aufgebaut, statt bei jeder Detailseite erneut linear durch
// alle Eintraege bzw. Zeugnisse zu suchen.
const entryById = new Map(entries.map((entry) => [entry['@id'], entry]))
const manuscriptById = new Map(manuscripts.map((manuscript) => [manuscript['@id'], manuscript]))
const expressionById = new Map(expressions.map((expression) => [expression['@id'], expression]))
const workById = new Map(works.map((work) => [work['@id'], work]))
const personById = new Map(persons.map((person) => [person['@id'], person]))
const printBySiglum = new Map(prints.map((print) => [print.siglum, print]))

// Rueckverweis Eintrag -> Werk fuer die Druck-Detailseite. Eintraege einer
// Fassung stehen nicht in work.entries, sondern in der Fassung; sie gehoeren
// zum Werk, dessen Fassung sie sind.
const workByEntryId = new Map<string, Work>()
for (const work of works) {
  work.entries.forEach((id) => workByEntryId.set(id, work))
}
for (const expression of expressions) {
  const work = workById.get(expression.realizationOf)
  if (work) {
    expression.entries.forEach((id) => workByEntryId.set(id, work))
  }
}

// Die Eintraege je Druck (Sigel), damit die Detailseite nicht jedes Mal alle
// Eintraege durchsucht.
const entriesBySiglum = new Map<string, CatalogueEntry[]>()
for (const entry of entries) {
  if (entry.firstPrint) {
    entriesBySiglum.set(entry.firstPrint, [...(entriesBySiglum.get(entry.firstPrint) ?? []), entry])
  }
}

export function getPerson(id: string): Person | undefined {
  return personById.get(id)
}

// Ein anzuzeigender Textdichter: der Name, wie er erscheinen soll, und die
// Person dahinter fuer GND/VIAF-Badges und Schreibvarianten.
export interface TextAuthorLabel {
  name: string
  person: Person | undefined
}

// Textdichter eines Werks oder einer Fassung in der festgelegten Schreibweise.
// Eine unsichere Zuschreibung bekommt das Fragezeichen des Rohwerts zurueck,
// das in der Personen-ID verloren geht, siehe Work.uncertainTextAuthors.
export function textAuthorLabels(
  item: Pick<Work, 'textAuthors' | 'uncertainTextAuthors'>,
): TextAuthorLabel[] {
  return item.textAuthors.map((id) => {
    const person = personById.get(id)
    const name = person?.preferredName ?? id
    const uncertain = item.uncertainTextAuthors.includes(id) && !name.endsWith('?')
    return { name: uncertain ? `${name}?` : name, person }
  })
}

// Textdichter eines einzelnen Drucks: der Rohwert, wie ihn der Druck schreibt,
// damit die Tabelle der Drucke die Quelle wiedergibt.
export function entryTextAuthorLabels(entry: CatalogueEntry): TextAuthorLabel[] {
  if (!entry.textAuthor) {
    return []
  }
  const person = entry.textAuthorPerson ? personById.get(entry.textAuthorPerson) : undefined
  return [{ name: entry.textAuthor, person }]
}

// Alle Namen eines Textdichters
export function textAuthorSearchNames(id: string): string[] {
  const person = personById.get(id)
  return person ? [person.preferredName, ...person.variantNames] : [id]
}

// Ein Werk hat entweder eine LV-Nummer aus dem Haupt-Katalog oder eine
// Nummer aus dem LV-Anhang (fuer Stuecke, die nur handschriftlich ueberliefert
// sind)
export function formatCatalogNumber(work: Pick<Work, 'lv' | 'lvAnh'>): string {
  if (work.lv !== null) {
    return `LV ${work.lv}`
  }
  if (work.lvAnh !== null) {
    return `Anh. ${work.lvAnh}`
  }
  return 'Ohne Katalognummer'
}

export function isBaseWork(work: Pick<Work, 'isPartOf'>): boolean {
  return work.isPartOf === null
}

// Der bevorzugte Titel (preferredTitle) ist der normalisierte Werktitel,
export function mainTitle(item: { preferredTitle: string | null }): string {
  return item.preferredTitle ?? ''
}

export function workSlug(work: Pick<Work, '@id'>): string {
  return work['@id'].replace(/^work:/, '')
}

export function findWorkBySlug(slug: string): Work | undefined {
  return workById.get(`work:${slug}`)
}

export function findWorkByExpressionSlug(slug: string): Work | undefined {
  const expression = expressionById.get(`expression:${slug}`)
  return expression ? workById.get(expression.realizationOf) : undefined
}


export function findWholeWork(work: Pick<Work, 'isPartOf'>): Work | undefined {
  return work.isPartOf ? workById.get(work.isPartOf) : undefined
}

// Die Teile eines Gesamtwerks in Katalogreihenfolge.
export function getParts(work: Pick<Work, 'hasPart'>): Work[] {
  return work.hasPart.map((id) => workById.get(id)).filter((part): part is Work => part !== undefined)
}

// Die uebrigen Werke derselben Gruppe: fuer ein Gesamtwerk seine Teile, fuer
// einen Teil das Gesamtwerk und die anderen Teile.
export function findRelatedParts(work: Work): Work[] {
  const whole = findWholeWork(work) ?? work
  return [whole, ...getParts(whole)].filter((candidate) => candidate['@id'] !== work['@id'])
}

// Die Eintraege eines Werks, chronologisch nach Erstdruck sortiert
export function getSortedEntries(work: Work): CatalogueEntry[] {
  const resolved = work.entries
    .map((id) => entryById.get(id))
    .filter((entry): entry is CatalogueEntry => entry !== undefined)

  return resolved.sort((a, b) => {
    const yearA = a.firstPrintYear ?? Infinity
    const yearB = b.firstPrintYear ?? Infinity
    if (yearA !== yearB) {
      return yearA - yearB
    }
    return (a.firstPrintNo ?? Infinity) - (b.firstPrintNo ?? Infinity)
  })
}

// Die Fassungen eines Werks, in der Reihenfolge der Teile, die sie betreffen
export function getExpressions(work: Work): Expression[] {
  return work.expressions
    .map((id) => expressionById.get(id))
    .filter((expression): expression is Expression => expression !== undefined)
}

// Die Handschriften eines Werks, sortiert nach Ort und Bibliothek,
// damit Handschriften aus derselben Stadt/Sammlung in der Tabelle zusammenstehen.
export function getManuscripts(work: Work): ManuscriptWitness[] {
  const resolved = work.manuscripts
    .map((id) => manuscriptById.get(id))
    .filter((manuscript): manuscript is ManuscriptWitness => manuscript !== undefined)

  return resolved.sort(
    (a, b) =>
      (a.place ?? '').localeCompare(b.place ?? '') ||
      (a.library ?? '').localeCompare(b.library ?? '') ||
      (a.shelfmark ?? '').localeCompare(b.shelfmark ?? ''),
  )
}

// Sigel wie "1575-3/I" enthalten einen Schraegstrich und werden deshalb fuer
// die Adresse kodiert.
export function printPath(siglum: string): string {
  return `/druck/${encodeURIComponent(siglum)}`
}

export function findPrintBySiglum(siglum: string): Print | undefined {
  return printBySiglum.get(siglum)
}

// Erscheinungsjahr eines Drucks. Bei Sigeln ohne Jahresangabe in prints.json
// (etwa "1575-3/I") steht das Jahr vorn im Sigel.
export function printYear(siglum: string): number | null {
  const year = printBySiglum.get(siglum)?.year
  if (year != null) {
    return year
  }
  const match = siglum.match(/^(\d{4})/)
  return match ? Number(match[1]) : null
}

// Ein Eintrag des Drucks zusammen mit dem Werk, zu dem er gehoert
export interface PrintContent {
  entry: CatalogueEntry
  work: Work | undefined
}

// Die Werke eines Drucks in LV-Reihenfolge
export function getPrintContents(print: Print): PrintContent[] {
  return (entriesBySiglum.get(print.siglum) ?? [])
    .map((entry) => ({ entry, work: workByEntryId.get(entry['@id']) }))
    .sort((a, b) => (a.entry.lv ?? '').localeCompare(b.entry.lv ?? '', 'de', { numeric: true }))
}
