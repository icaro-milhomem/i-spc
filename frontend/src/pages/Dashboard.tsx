import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { People, AttachMoney, Search, AccountBalance } from '@mui/icons-material';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalUsuarios: number;
  totalDividas: number;
  totalConsultas: number;
  valorTotalDividas: number;
}

const cardData = (stats: DashboardStats) => [
  {
    title: 'Total de Usuários',
    value: stats.totalUsuarios,
    icon: <People sx={{ color: '#1976d2', fontSize: 36 }} />,
  },
  {
    title: 'Total de Dívidas',
    value: stats.totalDividas,
    icon: <AttachMoney sx={{ color: '#FFD600', fontSize: 36 }} />,
  },
  {
    title: 'Total de Consultas',
    value: stats.totalConsultas,
    icon: <Search sx={{ color: '#003366', fontSize: 36 }} />,
  },
  {
    title: 'Valor Total em Dívidas',
    value: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(stats.valorTotalDividas),
    icon: <AccountBalance sx={{ color: '#43a047', fontSize: 36 }} />,
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalDividas: 0,
    totalConsultas: 0,
    valorTotalDividas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 0, width: '100%', display: 'flex' }}>
        <Paper elevation={4} sx={{ width: '100%', maxWidth: 1000, p: 4, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)', mr: 'auto' }}>
          <Typography variant="h4" sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold', textAlign: 'center', letterSpacing: 1 }}>
            Painel de Controle
          </Typography>
          <Grid container spacing={3} alignItems="stretch" justifyContent="center">
            {cardData(stats).map((card) => (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, minHeight: 120, borderRadius: 3, boxShadow: '0 2px 8px #1976d220' }}>
                  <Box>{card.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1, fontSize: 32 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, textAlign: 'center' }}>
                    {card.title}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
              Bem-vindo, {user?.nome}! Aqui você pode acompanhar os principais indicadores do sistema.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Dashboard;