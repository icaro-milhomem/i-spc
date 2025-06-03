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
import Layout from '../components/Layout';

interface Divida {
  id: number;
  valor: number;
  dataVencimento: string;
  status: string;
  protocolo?: string;
  empresa?: string;
  cnpj_empresa?: string;
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
          dataVencimento: d.data_vencimento || d.data_cadastro || '',
          status: d.status_negativado ? 'Pendente' : '',
          protocolo: d.protocolo || '',
          empresa: d.empresa || '',
          cnpj_empresa: d.cnpj_empresa || ''
        }))
      });
      // Registrar a consulta para contabilizar no dashboard (por CPF ou nome)
      const cpfParaRegistrar = cpf || response.data.cpf;
      if (cpfParaRegistrar) {
        await api.post('/consultas/registrar', {
          cpf: cpfParaRegistrar,
          tipo: cpf ? 'consulta_cpf' : 'consulta_nome',
          observacoes: 'Consulta feita via dashboard'
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao consultar. Tente novamente mais tarde.');
      console.error('Erro ao consultar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={4} sx={{ width: '100%', maxWidth: 700, p: 4, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
            Consulta de Cliente
          </Typography>
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
              sx={{ borderRadius: 2, mb: 2 }}
            />
            <TextField
              fullWidth
              label="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              margin="normal"
              placeholder="Nome do cliente"
              sx={{ borderRadius: 2, mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ mt: 2, borderRadius: 2, fontWeight: 700, fontSize: 18, px: 4, py: 1.2, boxShadow: '0 2px 8px #1976d220' }}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'CONSULTAR'}
            </Button>
          </form>
          {result && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 700 }}>
                Resultado da Consulta
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ textAlign: 'center' }}>
                <strong>CPF:</strong> {result.cpf}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ textAlign: 'center' }}>
                <strong>Nome:</strong> {result.nome}
              </Typography>
              {result.dividas.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2, boxShadow: '0 2px 8px #1976d210' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)' }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Protocolo</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Empresa</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>CNPJ da Empresa</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Valor</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Vencimento</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.dividas.map((divida) => (
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
        </Paper>
      </Box>
    </Layout>
  );
}; 