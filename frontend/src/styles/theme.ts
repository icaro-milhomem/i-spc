import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0f0f0f',
      paper: '#1e1e1e',
    },
    primary: {
      main: '#00bcd4', // ciano
      contrastText: '#fff',
    },
    secondary: {
      main: '#43a047', // verde
      contrastText: '#fff',
    },
    text: {
      primary: '#fff',
      secondary: '#ccc',
      disabled: '#888',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'background 0.2s, box-shadow 0.2s',
          '&:hover': {
            filter: 'brightness(1.15)',
            boxShadow: '0 2px 8px #00bcd455',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 10,
          input: {
            color: '#fff',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#ccc',
          '&.Mui-focused': {
            color: '#00bcd4',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(30,30,30,0.95)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 32px #0008',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #1e1e1e 0%, #23272f 100%)',
          color: '#fff',
          boxShadow: '2px 0 12px 0 rgba(0,0,0,0.18)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: 'rgba(30,30,30,0.98)',
          color: '#fff',
          boxShadow: '0 4px 32px #0008',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(30,30,30,0.98)',
          color: '#fff',
          boxShadow: '0 8px 40px #000a',
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme; 