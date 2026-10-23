import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// Werk- und Druckseiten verlinken aufeinander. Kam man innerhalb der App
// hierher, fuehrt der Button dorthin zurueck; bei direkt aufgerufener Adresse
// (location.key "default") zur Uebersicht.
export function BackButton({ overviewPath }: { overviewPath: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  if (location.key !== 'default') {
    return (
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Zurück
      </Button>
    )
  }
  return (
    <Button component={RouterLink} to={overviewPath} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
      Zurück zur Übersicht
    </Button>
  )
}
