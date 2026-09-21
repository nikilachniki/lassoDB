import type { Work } from '../types'

export interface WorksFilters {
  query: string
  textAuthors: string[]
  textSources: string
  voiceCounts: number[]
  prints: string
  completeEditions: string
}

export const defaultWorksFilters: WorksFilters = {
  query: '',
  textAuthors: [],
  textSources: '',
  voiceCounts: [],
  prints: '',
  completeEditions: '',
}

export function hasActiveFilters(filters: WorksFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.textAuthors.length > 0 ||
    filters.textSources.trim() !== '' ||
    filters.voiceCounts.length > 0 ||
    filters.prints.trim() !== '' ||
    filters.completeEditions.trim() !== ''
  )
}

const normalize = (value: string) => value.trim().toLocaleLowerCase('de-DE')

export function filterWorks(works: Work[], filters: WorksFilters): Work[] {
  const query = normalize(filters.query)
  const textSources = normalize(filters.textSources)
  const prints = normalize(filters.prints)
  const completeEditions = normalize(filters.completeEditions)

  return works.filter((work) => {
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
    if (prints && !work.prints.some((value) => normalize(value).includes(prints))) {
      return false
    }
    if (
      completeEditions &&
      !work.completeEditions.some((value) => normalize(value).includes(completeEditions))
    ) {
      return false
    }
    if (query) {
      const haystack = normalize(
        [
          work.lv,
          ...work.titles,
          ...work.textAuthors,
          ...work.textSources,
          ...work.prints,
          ...work.completeEditions,
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
