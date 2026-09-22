import entriesFile from './data/entries.json'
import manuscriptsFile from './data/manuscripts.json'
import personsFile from './data/persons.json'
import worksFile from './data/works.json'
import type {
  CatalogueEntry,
  EntriesFile,
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

// Ein Werk verweist per @id-Liste auf seine Eintraege (je ein Eintrag pro
// Druck, in dem es erschienen ist) und auf seine Handschriften-Zeugnisse.
// Einmal als Map aufgebaut, statt bei jeder Detailseite erneut linear durch
// alle Eintraege bzw. Zeugnisse zu suchen.
const entryById = new Map(entries.map((entry) => [entry['@id'], entry]))
const manuscriptById = new Map(manuscripts.map((manuscript) => [manuscript['@id'], manuscript]))
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

// Die LV-Nummer traegt die fachliche Gliederung eines mehrteiligen Werks:
// "100" ist die Basis, "100-2" ein Teilsatz und "100 (I)" eine Fassung davon.
// Nur die Basis (weder Teilsatz noch Fassung) steht fuer sich; Teile und
// Fassungen gehoeren inhaltlich zu ihr und werden auf deren Detailseite mit
// aufgelistet statt als eigener Tabelleneintrag anklickbar zu sein.
export function isBaseWork(work: Pick<Work, 'lvPart' | 'lvVariant'>): boolean {
  return work.lvPart === null && work.lvVariant === null
}

export function workSlug(work: Pick<Work, '@id'>): string {
  return work['@id'].replace(/^work:/, '')
}

export function findWorkBySlug(slug: string): Work | undefined {
  const id = `work:${slug}`
  return works.find((work) => work['@id'] === id)
}

// Weitere Teile/Fassungen desselben Werks: gleiche lvBase, alle ausser dem
// Werk selbst. Sortiert nach Teilsatz- vor Fassungsnummer, wie im Katalog.
export function findRelatedParts(work: Work): Work[] {
  if (work.lvBase === null) {
    return []
  }
  return works
    .filter((candidate) => candidate.lvBase === work.lvBase && candidate['@id'] !== work['@id'])
    .sort((a, b) => (a.lvPart ?? 0) - (b.lvPart ?? 0) || (a.lvVariant ?? '').localeCompare(b.lvVariant ?? ''))
}

// Die Basis eines Teils/einer Fassung. In der Tabelle sind nur Basiswerke
// anklickbar; ruft jemand die Detailseite eines Teils dennoch direkt auf
// (z.B. per geteiltem Link), verweist diese Funktion auf das zugehoerige
// Basiswerk, das die vollstaendige Uebersicht zeigt.
export function findBaseWork(lvBase: number): Work | undefined {
  return works.find((work) => work.lvBase === lvBase && isBaseWork(work))
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
