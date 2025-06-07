import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#003366', // Azul escuro
      light: '#1976d2', // Azul claro
      dark: '#001f4d',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFD600', // Amarelo destaque
      contrastText: '#003366',
    },
    background: {
      default: '#f6f8fa', // Cinza muito claro
      paper: '#fff',
    },
    text: {
      primary: '#222',
      secondary: '#4b5c6b',
    },
    info: {
      main: '#1976d2',
    },
    success: {
      main: '#43a047',
    },
    error: {
      main: '#e53935',
    },
    warning: {
      main: '#FFD600',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700, fontSize: '1rem' },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 700,
          fontSize: '1rem',
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'background 0.2s, color 0.2s',
        },
        containedPrimary: {
          backgroundColor: '#003366',
          color: '#fff',
          '&:hover': {
            backgroundColor: '#1976d2',
            color: '#fff',
          },
        },
        containedSecondary: {
          backgroundColor: '#FFD600',
          color: '#003366',
          '&:hover': {
            backgroundColor: '#ffe066',
            color: '#003366',
          },
        },
        outlined: {
          borderColor: '#003366',
          color: '#003366',
          '&:hover': {
            backgroundColor: '#f0f4fa',
            borderColor: '#1976d2',
            color: '#1976d2',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px 0 rgb(0 0 0 / 0.06)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px 0 rgb(0 0 0 / 0.04)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#fff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});