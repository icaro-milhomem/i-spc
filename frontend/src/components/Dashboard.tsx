import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import api from '../services/api';

interface Stats {
  totalUsuarios: number;
  totalClientes: number;
  totalDividas: number;
  totalConsultas: number;
  valorTotalDividas: number;
  totalEmpresas: number;
}

interface ConsultaPeriodo {
  data: string;
  quantidade: number;
}

interface ConsultaResult {
  cpf: string;
  nome: string;
  dividas: Array<{
    id: number;
    valor: number;
    data_vencimento: string;
    status: string;
  }>;
  data_consulta: string;
}

const Dashboard: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [resultado, setResultado] = useState<ConsultaResult | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchData = async () => {
    if (!isInitialLoad) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse] = await Promise.all([
        api.get<Stats>('/dashboard/stats'),
        api.get<{ consultasPorPeriodo: ConsultaPeriodo[] }>('/relatorios/consultas')
      ]);

      setStats(statsResponse.data);
    } catch (err: any) {
      if (err.__CANCEL__) {
        return;
      }
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultado(null);

    if (!cpf.trim()) {
      setError('CPF é obrigatório');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<ConsultaResult>('/consultas', { cpf });
      setResultado(response.data);
      setError(null);
    } catch (err: any) {
      if (err.__CANCEL__) {
        return;
      }
      console.error('Erro na consulta:', err);
      setError('Erro ao realizar consulta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isInitialLoad) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
        </Grid>

        {/* Cards de Estatísticas */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total de Clientes
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.totalClientes || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total de Dívidas
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.totalDividas || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total de Consultas
            </Typography>
            <Typography component="p" variant="h4">
              {stats?.totalConsultas || 0}
            </Typography>
          </Paper>
        </Grid>

        {/* Formulário de Consulta */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Consulta de Cliente
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                label="CPF"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                error={!!error}
                helperText={error}
                sx={{ flexGrow: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{ minWidth: 200 }}
                disabled={loading}
              >
                {loading ? 'Consultando...' : 'Consultar'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Resultado da Consulta */}
        {resultado && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Resultado da Consulta
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>CPF:</strong> {resultado.cpf}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Nome:</strong> {resultado.nome}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Data da Consulta:</strong> {new Date(resultado.data_consulta).toLocaleString()}
              </Typography>
              {resultado.dividas.length > 0 ? (
                <>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Dívidas Encontradas
                  </Typography>
                  <Grid container spacing={2}>
                    {resultado.dividas.map((divida) => (
                      <Grid item xs={12} md={4} key={divida.id}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'background.default',
                          }}
                        >
                          <Typography variant="subtitle1" gutterBottom>
                            <strong>Valor:</strong> R$ {divida.valor.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Vencimento:</strong> {new Date(divida.data_vencimento).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Status:</strong> {divida.status}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Nenhuma dívida encontrada para este CPF.
                </Alert>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 