// Entspricht dem Feldmodell aus lassoDBData/schema/entry.schema.json.
// Ein Werk kann in mehreren Drucken erscheinen, entryCount zeigt das an.

export interface Work {
  '@id': string
  '@type': 'Work'
  lv: string
  lvBase: number | null
  lvPart: number | null
  lvVariant: string | null
  titles: string[]
  voiceCounts: number[]
  prints: string[]
  textAuthors: string[]
  textSources: string[]
  completeEditions: string[]
  entries: string[]
  entryCount: number
}

export interface WorksFile {
  '@context': string
  items: Work[]
}
