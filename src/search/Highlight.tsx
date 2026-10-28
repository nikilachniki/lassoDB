import { useMemo } from 'react'
import Box from '@mui/material/Box'
import { parseQuery, termMatchesWord } from './textSearch'

const WORD = /[\p{L}\p{N}\p{M}]+/gu

// Markiert jedes Wort des Texts gelb, das ein Suchwort trifft, nach denselben
// Regeln wie die Suche (Wortanfang, Schreibvarianten, Zahlen, Tippfehler,
// siehe textSearch). Markiert wird das ganze Wort, nie die ganze Zelle.
export function Highlight({ text, query }: { text: string; query?: string }) {
  const parsed = useMemo(() => parseQuery(query ?? ''), [query])
  if (!parsed || !text) {
    return <>{text}</>
  }
  const parts: React.ReactNode[] = []
  let start = 0
  for (const match of text.matchAll(WORD)) {
    if (!termMatchesWord(parsed, match[0])) {
      continue
    }
    parts.push(text.slice(start, match.index))
    parts.push(
      <Box
        component="mark"
        key={match.index}
        sx={{ bgcolor: 'highlight.mark', color: 'inherit', p: 0, borderRadius: '2px' }}
      >
        {match[0]}
      </Box>,
    )
    start = match.index + match[0].length
  }
  parts.push(text.slice(start))
  return <>{parts}</>
}
