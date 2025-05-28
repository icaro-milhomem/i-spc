import React from 'react'
import ReactDOM from 'react-dom/client'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { ptBR } from 'date-fns/locale'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <App />
    </LocalizationProvider>
  </React.StrictMode>,
)
