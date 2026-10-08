// Entspricht dem Feldmodell aus lassoDBData/schema/entry.schema.json.
// Ein Werk kann in mehreren Drucken erscheinen, entryCount zeigt das an.

export interface Work {
  '@id': string
  '@type': 'Work'
  lv: string | null
  lvBase: number | null
  lvPart: number | null
  lvAnh: number | null
  // Teil-Beziehung: ein Teil wie "100-2" verweist auf sein Gesamtwerk
  // ("work:100"), das Gesamtwerk listet seine Teile.
  isPartOf: string | null
  hasPart: string[]
  // Titel des fruehesten Drucks (sonst der ersten Handschrift), dazu alle
  // weiteren Titel als Varianten.
  preferredTitle: string | null
  variantTitles: string[]
  voiceCounts: number[]
  prints: string[]
  // Personen-IDs (person:...), nicht Rohwerte, siehe Person
  textAuthors: string[]
  // Teilmenge von textAuthors, deren Zuschreibung in allen Eintraegen unsicher
  // ist (Rohwert mit "?", etwa "Ludwig Helmbold?")
  uncertainTextAuthors: string[]
  textSources: string[]
  completeEditions: string[]
  entries: string[]
  manuscripts: string[]
  // Fassungen des Werks, siehe Expression
  expressions: string[]
  entryCount: number
}

export interface WorksFile {
  '@context': string
  items: Work[]
}

// Eine Werk-Fassung im Sinne von FRBR (Expression)
export interface Expression {
  '@id': string
  '@type': 'Expression'
  lv: string
  lvBase: number
  pars: string
  realizationOf: string
  preferredTitle: string | null
  variantTitles: string[]
  voiceCounts: number[]
  prints: string[]
  textAuthors: string[]
  uncertainTextAuthors: string[]
  textSources: string[]
  completeEditions: string[]
  entries: string[]
}

export interface ExpressionsFile {
  '@context': string
  items: Expression[]
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
  // Rohwert, wie ihn der Druck schreibt; die Person dazu in textAuthorPerson
  textAuthor: string | null
  textAuthorPerson: string | null
  textAuthorUncertain: boolean
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

// Ein Textdichter. Schreibvarianten mit kuratierter GND-Zuordnung sind zu
// einer Person mit festgelegter Anzeigeform zusammengefuehrt
export interface Person {
  '@id': string
  '@type': 'Person'
  preferredName: string
  // Abweichende Schreibweisen aus der Quelle, ohne preferredName
  variantNames: string[]
  role: string
  gnd: string | null
  viaf: string | null
  entryCount: number
}

export interface PersonsFile {
  '@context': string
  items: Person[]
}
