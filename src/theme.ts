import { createTheme, alpha } from '@mui/material/styles'
import { deDE } from '@mui/x-data-grid/locales'
// noinspection ES6UnusedImports
import type {} from '@mui/x-data-grid/themeAugmentation'

// Farb- und Formsprache angelehnt an die Häuser, mit denen dieses Projekt
// inhaltlich verbunden ist: die LASSO-Handschriftendatenbank der BAdW
// (https://lasso.badw.de) und die Gesellschaft für Bayerische Musikgeschichte
// (https://gfbm-online.de), deren Löwen-Emblem im Header erscheint.
const brandNavy = '#243661'
const brandBlue = '#3F5FAC'
const brandBlueLight = '#7c93cf'

// Eigene Paletteneintraege fuer Farben, die keine MUI-Rolle haben, aber an
// mehreren Stellen gleich aussehen muessen: das Gelb der Suchtreffer (Markierung
// im Text und Balken an der Trefferzeile) und die Normdaten-Badges.
declare module '@mui/material/styles' {
  interface Palette {
    highlight: { mark: string; bar: string }
    authority: { gnd: string; viaf: string }
  }
  interface PaletteOptions {
    highlight?: { mark: string; bar: string }
    authority?: { gnd: string; viaf: string }
  }
}

export const theme = createTheme(
  {
    colorSchemes: {
      light: {
        palette: {
          primary: { main: brandBlue, dark: brandNavy, light: brandBlueLight },
          background: { default: '#F5F6FA' },
          highlight: { mark: 'rgba(255, 213, 0, 0.5)', bar: '#f2c200' },
          authority: { gnd: '#1a5fb4', viaf: '#26a269' },
        },
      },
      dark: {
        palette: {
          primary: { main: brandBlueLight, dark: brandNavy, light: '#a9bbe0' },
          // Auf dunklem Grund wuerde das halbtransparente Gelb den hellen Text
          // ueberstrahlen, daher schwaecher.
          highlight: { mark: 'rgba(255, 213, 0, 0.35)', bar: '#f2c200' },
          authority: { gnd: '#1a5fb4', viaf: '#26a269' },
        },
      },
    },
    shape: { borderRadius: 10 },
    // Ueberschriften sind durchweg fett; so steht das an einer Stelle statt
    // als fontWeight an jeder Ueberschrift. Abstaende bleiben an der Stelle.
    typography: {
      h4: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 700 },
    },
    components: {
      MuiAppBar: {
        defaultProps: { position: 'static', elevation: 0 },
        styleOverrides: {
          // Farben aus der Palette statt fest Weiss/Navy, damit der Header im
          // dunklen Modus mitwechselt.
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            color: theme.palette.mode === 'dark' ? theme.palette.text.primary : brandNavy,
            borderBottom: `3px solid ${brandBlue}`,
          }),
        },
      },
      MuiAccordion: {
        styleOverrides: {
          // Die Akkordeons stehen einzeln umrandet untereinander; die
          // Standard-Trennlinie oberhalb wuerde doppelt wirken.
          root: { '&::before': { display: 'none' } },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: { border: 'none' },
          columnHeaders: ({ theme }) => ({
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.08)`
              : alpha(theme.palette.primary.main, 0.08),
          }),
          footerContainer: { minHeight: 40 },
        },
      },
    },
  },
  deDE,
)
