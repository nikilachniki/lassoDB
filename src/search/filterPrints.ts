import type { CatalogueEntry, Print } from '../types'
import { getPrintContents, printYear, prints } from '../worksData'
import { inYearRange, matchesLv } from './filterFields'

// Ein Druck mit den zusammengefassten Angaben seiner Eintraege, Grundlage fuer
// Tabelle und Filter der Druckuebersicht.
export interface PrintSummary {
  print: Print
  year: number | null
  entries: CatalogueEntry[]
  voiceCounts: number[]
  textAuthors: string[]
  genres: string[]
  languages: string[]
}

function distinct<T>(values: (T | null)[]): T[] {
  return Array.from(new Set(values.filter((value): value is T => value !== null)))
}

// Einmal beim Laden aufgebaut, die Daten aendern sich zur Laufzeit nicht.
export const printSummaries: PrintSummary[] = prints.map((print) => {
  const entries = getPrintContents(print).map(({ entry }) => entry)
  return {
    print,
    year: printYear(print.siglum),
    entries,
    voiceCounts: distinct(entries.map((entry) => entry.voices)).sort((a, b) => a - b),
    textAuthors: distinct(entries.map((entry) => entry.textAuthorPerson)),
    genres: distinct(entries.map((entry) => entry.genre)).sort((a, b) => a.localeCompare(b, 'de')),
    languages: distinct(entries.map((entry) => entry.language)).sort((a, b) => a.localeCompare(b, 'de')),
  }
})

export interface PrintsFilters {
  query: string
  siglum: string
  yearFrom: string
  yearTo: string
  lv: string
  title: string
  textAuthors: string[]
  voiceCounts: number[]
  genres: string[]
  languages: string[]
}

export const defaultPrintsFilters: PrintsFilters = {
  query: '',
  siglum: '',
  yearFrom: '',
  yearTo: '',
  lv: '',
  title: '',
  textAuthors: [],
  voiceCounts: [],
  genres: [],
  languages: [],
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('de-DE')

// Die Listenfilter (Textdichter, Stimmen, Gattung, Sprache) treffen einen
// Druck, wenn mindestens eines seiner Werke passt, wie bei den Werken.
export function filterPrints(summaries: PrintSummary[], filters: PrintsFilters): PrintSummary[] {
  const query = normalize(filters.query)
  const siglum = normalize(filters.siglum)
  const title = normalize(filters.title)
  const anyOf = <T>(selected: T[], values: T[]) =>
    selected.length === 0 || selected.some((value) => values.includes(value))

  return summaries.filter((summary) => {
    if (siglum && !normalize(summary.print.siglum).includes(siglum)) {
      return false
    }
    if (!inYearRange(summary.year, filters.yearFrom, filters.yearTo)) {
      return false
    }
    if (filters.lv.trim() && !summary.entries.some((entry) => matchesLv(entry, filters.lv))) {
      return false
    }
    if (
      title &&
      !summary.entries.some((entry) =>
        [entry.title ?? '', entry.normalizedTitle ?? ''].some((value) => normalize(value).includes(title)),
      )
    ) {
      return false
    }
    if (
      !anyOf(filters.textAuthors, summary.textAuthors) ||
      !anyOf(filters.voiceCounts, summary.voiceCounts) ||
      !anyOf(filters.genres, summary.genres) ||
      !anyOf(filters.languages, summary.languages)
    ) {
      return false
    }
    if (query) {
      const haystack = normalize(
        [
          summary.print.siglum,
          summary.year ?? '',
          summary.print.rism ?? '',
          ...summary.genres,
          ...summary.languages,
        ].join(' '),
      )
      if (!haystack.includes(query)) {
        return false
      }
    }
    return true
  })
}
