import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
} from '@mui/material';
import api from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface Divida {
  id: number;
  valor: number;
  dataVencimento: string;
  status: string;
  protocolo?: string;
  empresa?: string;
  cnpj_empresa?: string;
}

export const ConsultaCPF: React.FC = () => {
  const [busca, setBusca] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!busca.trim()) {
      setError('Digite nome ou CPF');
      return;
    }
    setLoading(true);
    try {
      let params: any = {};
      if (/^[0-9]+$/.test(busca.trim())) {
        params.cpf = busca.trim();
      } else {
        params.nome = busca.trim();
      }
      const response = await api.get('/clientes/consulta', { params });
      setResult(response.data);
      setSuccessMessage('Consulta realizada com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao consultar');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Consultar Cliente
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'flex-end' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Nome ou CPF"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            sx={{ borderRadius: 2, mr: 2, width: 320 }}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            sx={{ height: 56, fontWeight: 700, fontSize: 16 }}
          >
            Buscar
          </Button>
        </form>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}
      {result && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Resultado da Consulta
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>CPF:</strong> {result.cpf}
            </Typography>
            <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <strong>Nome:</strong> {result.nome}
              {result.dividas && result.dividas.length > 0 ? (
                <CancelIcon sx={{ color: 'error.main', ml: 1 }} titleAccess="Cliente inadimplente" />
              ) : (
                <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} titleAccess="Cliente sem dívidas" />
              )}
            </Typography>
          </Box>
          {result.dividas && result.dividas.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Protocolo</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>CNPJ da Empresa</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Vencimento</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.dividas.map((divida: Divida) => (
                    <TableRow key={divida.id}>
                      <TableCell>{divida.protocolo || '—'}</TableCell>
                      <TableCell>{divida.empresa || '—'}</TableCell>
                      <TableCell>{divida.cnpj_empresa || '—'}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(divida.valor)}
                      </TableCell>
                      <TableCell>
                        {divida.dataVencimento && !isNaN(new Date(divida.dataVencimento).getTime())
                          ? new Date(divida.dataVencimento).toLocaleDateString('pt-BR')
                          : '—'}
                      </TableCell>
                      <TableCell>{divida.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              Nenhuma dívida encontrada para este cliente.
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}; 