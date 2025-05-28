import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface DashboardStats {
  totalUsuarios: number;
  totalDividas: number;
  totalConsultas: number;
  valorTotalDividas: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalDividas: 0,
    totalConsultas: 0,
    valorTotalDividas: 0,
  });

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      setError('Erro ao carregar estatísticas. Tente novamente mais tarde.');
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Bem-vindo, {user?.nome}!
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total de Usuários
            </Typography>
            <Typography variant="h4">
              {stats.totalUsuarios}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total de Dívidas
            </Typography>
            <Typography variant="h4">
              {stats.totalDividas}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Total de Consultas
            </Typography>
            <Typography variant="h4">
              {stats.totalConsultas}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Valor Total em Dívidas
            </Typography>
            <Typography variant="h4">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(stats.valorTotalDividas)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 