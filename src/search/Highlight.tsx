// Markiert jedes Vorkommen des Suchbegriffs im Text gelb, so wie die Suche
// vergleicht (getrimmt, ohne Gross-/Kleinschreibung, siehe filterWorks).
// Markiert wird nur der Text selbst, nie die ganze Zelle.
export function Highlight({ text, query }: { text: string; query?: string }) {
  const needle = query?.trim().toLocaleLowerCase('de-DE') ?? ''
  if (!needle) {
    return <>{text}</>
  }
  const haystack = text.toLocaleLowerCase('de-DE')
  const parts: React.ReactNode[] = []
  let start = 0
  let index = haystack.indexOf(needle)
  while (index >= 0) {
    parts.push(text.slice(start, index))
    parts.push(
      <mark
        key={index}
        style={{ backgroundColor: 'rgba(255, 213, 0, 0.5)', color: 'inherit', padding: 0, borderRadius: 2 }}
      >
        {text.slice(index, index + needle.length)}
      </mark>,
    )
    start = index + needle.length
    index = haystack.indexOf(needle, start)
  }
  parts.push(text.slice(start))
  return <>{parts}</>
}
