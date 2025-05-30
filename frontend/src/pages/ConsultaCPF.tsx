import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import api from '../services/api';
import { validateCPF } from '../utils/validators';

interface Divida {
  id: number;
  valor: number;
  dataVencimento: string;
  status: string;
}

interface ConsultaResult {
  cpf: string;
  nome: string;
  dividas: Divida[];
}

export const ConsultaCPF: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [result, setResult] = useState<ConsultaResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cpf.trim() && !nome.trim()) {
      setCpfError('Informe o CPF ou o nome');
      return;
    }

    if (cpf && !validateCPF(cpf)) {
      setCpfError('CPF inválido');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const params: any = {};
      if (cpf) params.cpf = cpf;
      if (nome) params.nome = nome;
      const response = await api.get('/clientes/consulta', { params });
      setResult({
        ...response.data,
        dividas: response.data.dividas.map((d: any) => ({
          ...d,
          dataVencimento: d.dataVencimento || d.data_vencimento
        }))
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao consultar. Tente novamente mais tarde.');
      console.error('Erro ao consultar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Consulta de Cliente
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="CPF"
            value={cpf}
            onChange={(e) => {
              setCpf(e.target.value);
              setCpfError('');
            }}
            error={!!cpfError}
            helperText={cpfError}
            margin="normal"
            placeholder="000.000.000-00"
          />

          <TextField
            fullWidth
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            margin="normal"
            placeholder="Nome do cliente"
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Consultar'}
          </Button>
        </form>

        {result && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Resultado da Consulta
            </Typography>

            <Typography variant="body1" gutterBottom>
              <strong>CPF:</strong> {result.cpf}
            </Typography>

            <Typography variant="body1" gutterBottom>
              <strong>Nome:</strong> {result.nome}
            </Typography>

            {result.dividas.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Valor</TableCell>
                      <TableCell>Vencimento</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.dividas.map((divida) => (
                      <TableRow key={divida.id}>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(divida.valor)}
                        </TableCell>
                        <TableCell>
                          {new Date(divida.dataVencimento).toLocaleDateString()}
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
      </Paper>
    </Box>
  );
}; 