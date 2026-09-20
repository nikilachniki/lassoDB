import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages liefert das Projekt unter https://nikilachniki.github.io/lassoDB/
// aus, also unter einem Unterpfad statt der Domainwurzel. Ohne den passenden
// base-Pfad wuerden alle relativ verlinkten Assets nach dem Deployment ins
// Leere zeigen. Lokal beim Entwickeln bleibt der Pfad die Wurzel.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/lassoDB/' : '/',
  plugins: [react()],
})
