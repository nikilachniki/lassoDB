// Entspricht dem Feldmodell aus lassoDBData/schema/entry.schema.json.
// Ein Werk kann in mehreren Drucken erscheinen, entryCount zeigt das an.

export interface Work {
  '@id': string
  '@type': 'Work'
  lv: string | null
  lvBase: number | null
  lvPart: number | null
  lvVariant: string | null
  // Nummer im LV-Anhang (Boetticher) fuer Werke, die nicht im Haupt-LV-Katalog
  // stehen, sondern nur handschriftlich ueberliefert sind. lv und lvAnh
  // schliessen sich gegenseitig aus: entweder das Werk hat eine reguläre
  // LV-Nummer, oder es steht im Anhang, nie beides.
  lvAnh: number | null
  titles: string[]
  voiceCounts: number[]
  prints: string[]
  textAuthors: string[]
  textSources: string[]
  completeEditions: string[]
  entries: string[]
  manuscripts: string[]
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

// Ein Zeugnis entspricht einem Lasso-Stueck in einer Handschrift, nicht dem
// Werk selbst. Dieselbe Komposition kann in mehreren Handschriften
// ueberliefert sein, und eine Handschrift kann mehrere Stuecke enthalten.
export interface ManuscriptWitness {
  '@id': string
  '@type': 'ManuscriptWitness'
  id: number
  lv: string | null
  lvBase: number | null
  lvPart: number | null
  lvAnh: number | null
  title: string | null
  voices: number | null
  voicesRaw?: string
  dating: string | null
  rismSiglum: string | null
  link: string | null
  place: string | null
  library: string | null
  shelfmark: string | null
  shelfmarkAlt: string | null
  sourceDescription: string | null
  provenance: string | null
  sourceNote: string | null
  literature: string | null
  note: string | null
}

export interface ManuscriptsFile {
  '@context': string
  items: ManuscriptWitness[]
}

// Ein Textdichter als Rohwert, siehe lassoDBData/docs/entscheidungen.md,
// Abschnitt 8. gnd/viaf sind nur fuer einen Teil der Personen gesetzt, siehe
// Abschnitt 15: eine manuell kuratierte, keine automatische Verknuepfung.
export interface Person {
  '@id': string
  '@type': 'Person'
  nameRaw: string
  role: string
  gnd: string | null
  viaf: string | null
  entryCount: number
}

export interface PersonsFile {
  '@context': string
  items: Person[]
}
