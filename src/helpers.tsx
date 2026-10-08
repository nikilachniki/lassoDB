import Link from '@mui/material/Link'
import { Highlight } from './search/Highlight'
import type { TextAuthorLabel } from './worksData'

// Kleines Badge-Icon fuer eine Normdaten-Verknuepfung (GND/VIAF), das direkt
// neben dem Textdichter-Namen steht statt den Namen selbst zu verlinken —
// so bleibt der Name reiner Text und beide Verknuepfungen sind unabhaengig
// voneinander sichtbar, wenn beide vorhanden sind.
function AuthorityBadge({ label, href, color }: { label: string; href: string; color: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label === 'GND' ? 'Gemeinsame Normdatei' : 'Virtual International Authority File'}
      title={label === 'GND' ? 'Gemeinsame Normdatei' : 'Virtual International Authority File'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ml: 0.5,
        px: 0.5,
        height: 15,
        minWidth: 15,
        borderRadius: 0.5,
        fontSize: '0.55rem',
        fontWeight: 700,
        lineHeight: 1,
        color: '#fff',
        backgroundColor: color,
        textDecoration: 'none',
        verticalAlign: 'middle',
      }}
    >
      {label}
    </Link>
  )
}

// Beschriftung fuer den Textdichter/Textprovenienz-Block: "Textdichter", wenn
// nur Textdichter vorkommen, "Textprovenienz", wenn nur Textprovenienz
// vorkommt, sonst (beides oder keins von beidem) die Kombination — beides
// kommt laut Abschnitt 8 nur bei 2 von 1.945 Werken vor, ist also die
// Ausnahme, nicht der Regelfall, den die Beschriftung bisher immer zeigte.
export function authorOrSourceLabel(hasAuthors: boolean, hasSources: boolean): string {
  if (hasAuthors && !hasSources) {
    return 'Textdichter'
  }
  if (hasSources && !hasAuthors) {
    return 'Textprovenienz'
  }
  return 'Textdichter / Textprovenienz'
}

// Zeigt jeden Textdichter-Namen als Text und haengt daneben ein GND- bzw.
// VIAF-Badge an, sofern lassoDBData eine Zuordnung hat (siehe
// worksData.textAuthorLabels). Ohne Zuordnung bleibt der Name ohne Badge,
// statt auf einen Treffer zu raten, siehe
// lassoDBData/docs/entscheidungen.md, Abschnitt 15. Die uebrigen
// Schreibweisen der Person erscheinen als Tooltip, siehe Abschnitt 19.
// Gemeinsam genutzt von der Werk-Detailseite und der Katalogtabelle, damit
// die Verknuepfung ueberall gleich aussieht.
// highlight: optionaler Suchbegriff, der in Namen und Provenienz markiert wird.
export function AuthorOrSourceText({
  authors,
  sources,
  highlight,
}: {
  authors: TextAuthorLabel[]
  sources: string[]
  highlight?: string
}) {
  if (authors.length === 0 && sources.length === 0) {
    return null
  }
  return (
    <>
      {authors.map(({ name, person }, index) => {
        // Ohne das Fragezeichen einer unsicheren Zuschreibung verglichen, sonst
        // hiesse es bei "Ludwig Helmbold?" nur "Auch: Ludwig Helmbold".
        const bareName = name.replace(/\?$/, '')
        const otherNames = person
          ? [person.preferredName, ...person.variantNames].filter(
              (other) => other.replace(/\?$/, '') !== bareName,
            )
          : []
        return (
          <span key={name} title={otherNames.length > 0 ? `Auch: ${otherNames.join(', ')}` : undefined}>
            {index > 0 && ', '}
            <Highlight text={name} query={highlight} />
            {person?.gnd && (
              <AuthorityBadge label="GND" href={`https://d-nb.info/gnd/${person.gnd}`} color="authority.gnd" />
            )}
            {person?.viaf && (
              <AuthorityBadge label="VIAF" href={`https://viaf.org/viaf/${person.viaf}`} color="authority.viaf" />
            )}
          </span>
        )
      })}
      {authors.length > 0 && sources.length > 0 && ' / '}
      <Highlight text={sources.join(', ')} query={highlight} />
    </>
  )
}
