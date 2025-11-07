import { Route, Routes, useLocation } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import IBPTax from './pages/IBPTax'
import XMLValidation from './pages/XMLValidation'
import CNPJLookup from './pages/CNPJLookup'
import Clients from './pages/Clients'
import Settings from './pages/Settings'
import Logs from './pages/Logs'
import CosmosLookup from './pages/CosmosLookup'
import SpeedTest from './pages/SpeedTest'
import PortCheck from './pages/PortCheck'
import XMLConverter from './pages/XMLConverter'
import XMLReport from './pages/XMLReport'
import LoginPage from './pages/Login'
import { useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { useTheme } from './components/theme-provider'

// Paleta de cores para o tema escuro, alinhada com o layout original
const originalDarkPalette = {
  primary: {
    main: '#1976d2', // Azul dos botões, como no layout original
    contrastText: '#ffffff',
  },
  background: {
    default: '#0b1324', // Fundo principal escuro
    paper: '#111827',   // Fundo do menu e cards
  },
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
  },
}

// Paleta de cores para o tema claro, recriada para combinar com o design original
const originalLightPalette = {
  primary: {
    main: '#1976d2', // Azul principal dos botões e header
  },
  background: {
    default: '#f4f6f8', // Fundo levemente acinzentado
    paper: '#ffffff',   // Fundo branco para o menu lateral e cards
  },
  divider: 'rgba(0, 0, 0, 0.12)', // Cor padrão do divisor para o tema claro
}

export default function App() {
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  // Resolve o tema "system" para 'light' ou 'dark'
  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }, [theme]) as 'light' | 'dark'

  const toggleMode = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: resolvedTheme,
          ...(resolvedTheme === 'dark' ? originalDarkPalette : originalLightPalette),
        },
      }),
    [resolvedTheme],
  )

  return (
    <Routes location={location}>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <MuiThemeProvider theme={muiTheme}>
            <CssBaseline />
            <AppLayout mode={resolvedTheme} onToggleMode={toggleMode} />
          </MuiThemeProvider>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/ibptax" element={<IBPTax />} />
        <Route path="/xml" element={<XMLValidation />} />
        <Route path="/cnpj" element={<CNPJLookup />} />
        <Route path="/speed" element={<SpeedTest />} />
        <Route path="/ports" element={<PortCheck />} />
        <Route path="/xml-converter" element={<XMLConverter />} />
        <Route path="/xml-report" element={<XMLReport />} />

        <Route path="/clientes" element={<Clients />} />
        <Route path="/config" element={<Settings />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/cosmos" element={<CosmosLookup />} />
      </Route>
    </Routes>
  )
}