import type { Work } from '../types'
import { getExpressions, getManuscripts, printYear, textAuthorSearchNames, workPrintSigla } from '../worksData'
import { inYearRange, matchesLv } from './filterFields'

export interface WorksFilters {
  query: string
  lv: string
  title: string
  textAuthors: string[]
  textSources: string
  voiceCounts: number[]
  prints: string
  yearFrom: string
  yearTo: string
  completeEditions: string
  genres: string[]
  languages: string[]
  manuscripts: string
}

export const defaultWorksFilters: WorksFilters = {
  query: '',
  lv: '',
  title: '',
  textAuthors: [],
  textSources: '',
  voiceCounts: [],
  prints: '',
  yearFrom: '',
  yearTo: '',
  completeEditions: '',
  genres: [],
  languages: [],
  manuscripts: '',
}

export function hasActiveFilters(filters: WorksFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.lv.trim() !== '' ||
    filters.title.trim() !== '' ||
    filters.textAuthors.length > 0 ||
    filters.textSources.trim() !== '' ||
    filters.voiceCounts.length > 0 ||
    filters.prints.trim() !== '' ||
    filters.yearFrom !== '' ||
    filters.yearTo !== '' ||
    filters.completeEditions.trim() !== '' ||
    filters.genres.length > 0 ||
    filters.languages.length > 0 ||
    filters.manuscripts.trim() !== ''
  )
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('de-DE')

export function filterWorks(works: Work[], filters: WorksFilters): Work[] {
  const query = normalize(filters.query)
  const textSources = normalize(filters.textSources)
  const prints = normalize(filters.prints)
  const completeEditions = normalize(filters.completeEditions)
  const title = normalize(filters.title)
  const manuscripts = normalize(filters.manuscripts)

  return works.filter((work) => {
    // Fassungen gehoeren zum Werk, ihre Nummern, Titel und Drucke zaehlen mit.
    const expressions = getExpressions(work)
    // Alle Drucke, auch Nachdrucke und die Erstdrucke der Fassungen
    const printSigla = workPrintSigla(work)
    if (filters.lv.trim() && ![work, ...expressions].some((item) => matchesLv(item, filters.lv))) {
      return false
    }
    if (
      title &&
      ![work.preferredTitle ?? '', ...work.variantTitles, ...expressions.flatMap((e) => [e.preferredTitle ?? '', ...e.variantTitles])].some(
        (value) => normalize(value).includes(title),
      )
    ) {
      return false
    }
    if (
      filters.textAuthors.length > 0 &&
      !filters.textAuthors.some((author) => work.textAuthors.includes(author))
    ) {
      return false
    }
    if (textSources && !work.textSources.some((value) => normalize(value).includes(textSources))) {
      return false
    }
    if (
      filters.voiceCounts.length > 0 &&
      !filters.voiceCounts.some((count) => work.voiceCounts.includes(count))
    ) {
      return false
    }
    if (prints && !printSigla.some((value) => normalize(value).includes(prints))) {
      return false
    }
    if (
      (filters.yearFrom || filters.yearTo) &&
      !printSigla.some((siglum) =>
        inYearRange(printYear(siglum), filters.yearFrom, filters.yearTo),
      )
    ) {
      return false
    }
    if (
      manuscripts &&
      !getManuscripts(work).some((manuscript) => normalize(manuscript.rismSiglum ?? '').includes(manuscripts))
    ) {
      return false
    }
    if (
      completeEditions &&
      !work.completeEditions.some((value) => normalize(value).includes(completeEditions))
    ) {
      return false
    }
    if (filters.genres.length > 0 && !filters.genres.some((genre) => work.genres.includes(genre))) {
      return false
    }
    if (
      filters.languages.length > 0 &&
      !filters.languages.some((language) => work.languages.includes(language))
    ) {
      return false
    }
    if (query) {
      const haystack = normalize(
        [
          work.lv,
          work.lvAnh !== null ? `Anh. ${work.lvAnh}` : '',
          work.preferredTitle ?? '',
          ...work.variantTitles,
          ...work.textAuthors.flatMap(textAuthorSearchNames),
          ...work.textSources,
          ...printSigla,
          ...work.completeEditions,
          ...work.genres,
          ...work.languages,
          // Fassungen gehoeren zum Werk: Wer nach ihrer LV-Nummer oder ihrem Titel
          // sucht, soll das Werk finden. Ihre Drucke stehen schon in printSigla.
          ...expressions.flatMap((expression) => [
            expression.lv,
            expression.preferredTitle ?? '',
            ...expression.variantTitles,
          ]),
        ].join(' '),
      )
      if (!haystack.includes(query)) {
        return false
      }
    }
    return true
  })
}

export function collectDistinct<T>(works: Work[], pick: (work: Work) => T[]): T[] {
  const values = new Set<T>()
  works.forEach((work) => pick(work).forEach((value) => values.add(value)))
  return Array.from(values)
}
