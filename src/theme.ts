import { createTheme, alpha } from '@mui/material/styles'
import { deDE } from '@mui/x-data-grid/locales'
import type {} from '@mui/x-data-grid/themeAugmentation'

// Farb- und Formsprache angelehnt an die Häuser, mit denen dieses Projekt
// inhaltlich verbunden ist: die LASSO-Handschriftendatenbank der BAdW
// (https://lasso.badw.de) und die Gesellschaft für Bayerische Musikgeschichte
// (https://gfbm-online.de), deren Löwen-Emblem im Header erscheint.
const brandNavy = '#243661'
const brandBlue = '#3F5FAC'
const brandBlueLight = '#7c93cf'

export const theme = createTheme(
  {
    colorSchemes: {
      light: {
        palette: {
          primary: { main: brandBlue, dark: brandNavy, light: brandBlueLight },
          background: { default: '#F5F6FA' },
        },
      },
      dark: {
        palette: {
          primary: { main: brandBlueLight, dark: brandNavy, light: '#a9bbe0' },
        },
      },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiAppBar: {
        defaultProps: { position: 'static', elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: '#FFFFFF',
            color: brandNavy,
            borderBottom: `3px solid ${brandBlue}`,
          },
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
