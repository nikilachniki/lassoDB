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

// Ein Eintrag entspricht einem Werk in genau einem Druck, nicht dem Werk
// selbst. Dieselbe Komposition kann als mehrere Eintraege auftauchen, wenn
// sie in mehreren Drucken erschienen ist; das Work-Objekt fasst sie zusammen.
export interface CatalogueEntry {
  '@id': string
  '@type': 'CatalogueEntry'
  id: number
  lv: string | null
  lvBase: number | null
  lvPart: number | null
  lvVariant: string | null
  title: string | null
  titleRaw: string | null
  voices: number | null
  voicesRaw?: string
  firstPrint: string | null
  firstPrintYear: number | null
  firstPrintNo: number | null
  textAuthor: string | null
  textSource: string | null
  completeEdition: string | null
  note: string | null
}

export interface EntriesFile {
  '@context': string
  items: CatalogueEntry[]
}
