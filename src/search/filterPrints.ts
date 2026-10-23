import type { Print } from '../types'
import {
  getParts,
  getPrintContents,
  printReferences,
  printRism,
  printYear,
  prints,
  type WorkInPrint,
} from '../worksData'
import { inYearRange, matchesLv } from './filterFields'

// Ein Druck mit den zusammengefassten Angaben seiner Werke, Grundlage fuer
// Tabelle und Filter der Druckuebersicht.
export interface PrintSummary {
  print: Print
  year: number | null
  contents: WorkInPrint[]
  voiceCounts: number[]
  textAuthors: string[]
  genres: string[]
  languages: string[]
}

function distinct<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

// Einmal beim Laden aufgebaut, die Daten aendern sich zur Laufzeit nicht.
// Die Angaben kommen vom Werk, nicht vom Eintrag, weil Nachdrucke keine
// eigenen Eintraege haben.
export const printSummaries: PrintSummary[] = prints.map((print) => {
  const contents = getPrintContents(print)
  const works = contents.map(({ work }) => work)
  return {
    print,
    year: printYear(print.siglum),
    contents,
    voiceCounts: distinct(works.flatMap((work) => work.voiceCounts)).sort((a, b) => a - b),
    textAuthors: distinct(works.flatMap((work) => work.textAuthors)),
    genres: distinct(works.flatMap((work) => work.genres)).sort((a, b) => a.localeCompare(b, 'de')),
    languages: distinct(works.flatMap((work) => work.languages)).sort((a, b) => a.localeCompare(b, 'de')),
  }
})

export interface PrintsFilters {
  query: string
  siglum: string
  description: string
  printTitle: string
  references: string
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
  description: '',
  printTitle: '',
  references: '',
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

// Titelblaetter sind diplomatisch wiedergegeben: Zeilenwechsel "|", Trennstrich
// "=" und kombinierende Zeichen (m̄, uͤ). Fuer die Suche fallen sie weg, damit
// "primo libro" auch ueber einen Zeilenwechsel hinweg trifft.
const normalizeTitle = (value: string) =>
  normalize(
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/=\s*\|\s*/g, '')
      .replace(/\s*\|\s*/g, ' '),
  )

// Die Listenfilter (Textdichter, Stimmen, Gattung, Sprache) treffen einen
// Druck, wenn mindestens eines seiner Werke passt, wie bei den Werken.
export function filterPrints(summaries: PrintSummary[], filters: PrintsFilters): PrintSummary[] {
  const query = normalize(filters.query)
  const siglum = normalize(filters.siglum)
  const title = normalize(filters.title)
  const description = normalize(filters.description)
  const printTitle = normalize(filters.printTitle)
  const references = normalize(filters.references)
  const anyOf = <T>(selected: T[], values: T[]) =>
    selected.length === 0 || selected.some((value) => values.includes(value))

  return summaries.filter((summary) => {
    if (siglum && !normalize(summary.print.siglum).includes(siglum)) {
      return false
    }
    if (!inYearRange(summary.year, filters.yearFrom, filters.yearTo)) {
      return false
    }
    if (description && !normalize(summary.print.description ?? '').includes(description)) {
      return false
    }
    if (printTitle && !normalizeTitle(summary.print.title ?? '').includes(normalizeTitle(filters.printTitle))) {
      return false
    }
    if (
      references &&
      ![...printReferences(summary.print), { catalogue: 'RISM', value: printRism(summary.print)?.label ?? '' }].some(
        (reference) => normalize(`${reference.catalogue ?? ''} ${reference.value}`).includes(references),
      )
    ) {
      return false
    }
    // Das Register fuehrt Gesamtwerke; "100-2" soll den Druck trotzdem finden,
    // wenn LV 100 darin steht.
    if (
      filters.lv.trim() &&
      !summary.contents.some(({ work }) => [work, ...getParts(work)].some((item) => matchesLv(item, filters.lv)))
    ) {
      return false
    }
    if (
      title &&
      !summary.contents.some(({ work, entries }) =>
        [
          work.preferredTitle ?? '',
          ...work.variantTitles,
          ...entries.map((entry) => entry.title ?? ''),
        ].some((value) => normalize(value).includes(title)),
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
          printRism(summary.print)?.label ?? '',
          summary.print.description ?? '',
          normalizeTitle(summary.print.title ?? ''),
          summary.print.partbooks ?? '',
          ...printReferences(summary.print).map((reference) => `${reference.catalogue ?? ''} ${reference.value}`),
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
