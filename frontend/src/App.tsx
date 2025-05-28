import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;