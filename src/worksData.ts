import entriesFile from './data/entries.json'
import expressionsFile from './data/expressions.json'
import manuscriptsFile from './data/manuscripts.json'
import personsFile from './data/persons.json'
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
  Work,
  WorksFile,
} from './types'

// Die JSON-Importe sind zur Buildzeit eingebunden, siehe scripts/sync-data.mjs.
// Es gibt keinen Server und keine Laufzeitabfrage, der gesamte Bestand liegt
// im Bundle und wird clientseitig durchsucht und gefiltert.
export const works = (worksFile as WorksFile).items
const entries = (entriesFile as EntriesFile).items
const manuscripts = (manuscriptsFile as ManuscriptsFile).items
const persons = (personsFile as PersonsFile).items
const expressions = (expressionsFile as ExpressionsFile).items

// Ein Werk verweist per @id-Liste auf seine Eintraege (je ein Eintrag pro
// Druck, in dem es erschienen ist) und auf seine Handschriften-Zeugnisse.
// Einmal als Map aufgebaut, statt bei jeder Detailseite erneut linear durch
// alle Eintraege bzw. Zeugnisse zu suchen.
const entryById = new Map(entries.map((entry) => [entry['@id'], entry]))
const manuscriptById = new Map(manuscripts.map((manuscript) => [manuscript['@id'], manuscript]))
const expressionById = new Map(expressions.map((expression) => [expression['@id'], expression]))
const workById = new Map(works.map((work) => [work['@id'], work]))
// Textdichter sind in Work/CatalogueEntry nur als Rohwert (String) verlinkt,
// nicht per @id, daher der Schluessel ueber den exakten Namen statt einer ID.
const personByName = new Map(persons.map((person) => [person.nameRaw, person]))

// Liefert die Normdaten-Verknuepfung zu einem Textdichter-Rohwert, falls
// vorhanden. Nicht jeder Textdichter hat eine GND/VIAF-Zuordnung, siehe
// lassoDBData/docs/entscheidungen.md, Abschnitt 15.
export function findPersonByName(name: string): Person | undefined {
  return personByName.get(name)
}

// Ein Werk hat entweder eine LV-Nummer aus dem Haupt-Katalog oder eine
// Nummer aus dem LV-Anhang (fuer Stuecke, die nur handschriftlich ueberliefert
// sind), nie beides. Diese Funktion liefert die passende Anzeige dafuer, statt
// dass jede Stelle in der Oberflaeche das Unterscheiden selbst nachbauen muss.
export function formatCatalogNumber(work: Pick<Work, 'lv' | 'lvAnh'>): string {
  if (work.lv !== null) {
    return `LV ${work.lv}`
  }
  if (work.lvAnh !== null) {
    return `Anh. ${work.lvAnh}`
  }
  return 'Ohne Katalognummer'
}

// Ein mehrteiliges Werk besteht aus dem Gesamtwerk, etwa "100", und seinen
// Teilen wie "100-2". Die Daten halten das ausdruecklich fest: ein Teil
// verweist mit isPartOf auf das Gesamtwerk, das Gesamtwerk listet seine Teile
// in hasPart. Fassungen wie "100 (I)" sind keine eigenen Werke, sondern
// Expressions des Werks, siehe getExpressions.
export function isBaseWork(work: Pick<Work, 'isPartOf'>): boolean {
  return work.isPartOf === null
}

// Der bevorzugte Titel (preferredTitle) ist laut Datenmodell der des
// fruehesten Drucks, bei reinen Handschriften-Werken der der ersten
// Handschrift; alle weiteren Titel stehen in variantTitles.
export function mainTitle(item: { preferredTitle: string | null }): string {
  return item.preferredTitle ?? ''
}

export function workSlug(work: Pick<Work, '@id'>): string {
  return work['@id'].replace(/^work:/, '')
}

export function findWorkBySlug(slug: string): Work | undefined {
  return workById.get(`work:${slug}`)
}

// Fassungen waren frueher eigene Werke mit eigener Adresse, etwa
// /werk/74-IV. Solche Links fuehren jetzt zum Werk, zu dem die Fassung gehoert.
export function findWorkByExpressionSlug(slug: string): Work | undefined {
  const expression = expressionById.get(`expression:${slug}`)
  return expression ? workById.get(expression.realizationOf) : undefined
}

// Das Gesamtwerk eines Teils, fuer ein Gesamtwerk selbst undefined.
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

// Die Eintraege eines Werks, chronologisch nach Erstdruck sortiert (Jahr,
// dann laufende Nummer innerhalb des Jahres). Eintraege ohne Jahresangabe
// werden ans Ende gestellt statt faelschlich als "Erstdruck" zu gelten.
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
// (so liefert sie der Import bereits).
export function getExpressions(work: Work): Expression[] {
  return work.expressions
    .map((id) => expressionById.get(id))
    .filter((expression): expression is Expression => expression !== undefined)
}

// Die Handschriften-Zeugnisse eines Werks, sortiert nach Ort und Bibliothek,
// damit Zeugnisse aus derselben Stadt/Sammlung in der Tabelle zusammenstehen.
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
