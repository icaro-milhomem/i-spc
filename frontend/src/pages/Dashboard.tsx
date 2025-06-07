import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { People, AttachMoney, Search, AccountBalance, Apartment } from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import { format, subDays } from 'date-fns';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface DashboardStats {
  totalUsuarios: number;
  totalDividas: number;
  totalConsultas: number;
  valorTotalDividas: number;
  totalEmpresas: number;
}

const cardData = (stats: DashboardStats) => [
  {
    title: 'Total de Usuários',
    value: stats.totalUsuarios,
    icon: <People sx={{ color: '#1976d2', fontSize: 28 }} />,
  },
  {
    title: 'Total de Empresas',
    value: stats.totalEmpresas,
    icon: <Apartment sx={{ color: 'primary.main', fontSize: 28 }} />,
  },
  {
    title: 'Total de Dívidas',
    value: stats.totalDividas,
    icon: <AttachMoney sx={{ color: '#FFD600', fontSize: 28 }} />,
  },
  {
    title: 'Total de Consultas',
    value: stats.totalConsultas,
    icon: <Search sx={{ color: '#003366', fontSize: 28 }} />,
  },
  {
    title: 'Valor Total em Dívidas',
    value: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(stats.valorTotalDividas),
    icon: <AccountBalance sx={{ color: '#43a047', fontSize: 28 }} />,
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalDividas: 0,
    totalConsultas: 0,
    valorTotalDividas: 0,
    totalEmpresas: 0,
  });
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [consultasPorPeriodo, setConsultasPorPeriodo] = useState<{ data: string, quantidade: number }[]>([]);

  // Cores dinâmicas do tema
  const barColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];
  const bgColor = theme.palette.background.paper;
  const textColor = theme.palette.text.primary;
  const gridColor = theme.palette.mode === 'dark' ? '#333' : '#eee';
  const tooltipBg = theme.palette.mode === 'dark' ? '#222' : '#fff';
  const tooltipText = theme.palette.mode === 'dark' ? '#fff' : '#222';

  // Gradiente para as barras
  const getBarGradient = (ctx: any, color: string) => {
    const chart = ctx.chart;
    const { ctx: canvasCtx, chartArea } = chart;
    if (!chartArea) return color;
    const gradient = canvasCtx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, color + '99');
    gradient.addColorStop(1, color);
    return gradient;
  };

  // Gráfico de barras dos marcadores com animação e gradiente
  const barData = {
    labels: ['Usuários', 'Empresas', 'Dívidas', 'Consultas'],
    datasets: [
      {
        label: 'Total',
        data: [stats.totalUsuarios, stats.totalEmpresas, stats.totalDividas, stats.totalConsultas],
        backgroundColor: (ctx: any) => {
          const idx = ctx.dataIndex;
          return getBarGradient(ctx, barColors[idx] || barColors[0]);
        },
        borderRadius: 16,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.5,
        hoverBackgroundColor: (ctx: any) => {
          const idx = ctx.dataIndex;
          return barColors[idx] || barColors[0];
        },
        hoverBorderWidth: 2,
        hoverBorderColor: theme.palette.secondary.main,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Resumo dos Marcadores',
        font: { size: 20, weight: 700 },
        color: textColor,
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        caretSize: 8,
        cornerRadius: 8,
        animation: { duration: 400 },
      },
    },
    layout: {
      padding: 16,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 16, weight: 700 }, color: textColor },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, font: { size: 16 }, color: textColor },
        grid: { color: gridColor },
      },
    },
    backgroundColor: bgColor,
  };

  // Gradiente para as fatias do doughnut
  const getDoughnutGradient = (ctx: any, color: string) => {
    const chart = ctx.chart;
    const { ctx: canvasCtx, chartArea } = chart;
    if (!chartArea) return color;
    const gradient = canvasCtx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
    gradient.addColorStop(0, color + '99');
    gradient.addColorStop(1, color);
    return gradient;
  };
  const doughnutData = {
    labels: ['Usuários', 'Empresas', 'Dívidas', 'Consultas'],
    datasets: [
      {
        data: [stats.totalUsuarios, stats.totalEmpresas, stats.totalDividas, stats.totalConsultas],
        backgroundColor: (ctx: any) => {
          const idx = ctx.dataIndex;
          return getDoughnutGradient(ctx, barColors[idx] || barColors[0]);
        },
        borderWidth: 2,
        borderColor: theme.palette.background.paper,
        hoverOffset: 16,
        hoverBorderColor: theme.palette.secondary.main,
        hoverBorderWidth: 3,
      },
    ],
  };
  const doughnutOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { color: textColor, font: { size: 16, weight: 700 } },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        caretSize: 8,
        cornerRadius: 8,
        animation: { duration: 400 },
      },
    },
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Evolução de Consultas (7 dias)',
        font: { size: 18, weight: 700 },
        color: textColor,
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: tooltipText,
        bodyColor: tooltipText,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        caretSize: 8,
        cornerRadius: 8,
        animation: { duration: 400 },
      },
    },
    layout: {
      padding: 16,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 14, weight: 700 }, color: textColor },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0, font: { size: 14 }, color: textColor },
        grid: { color: gridColor },
      },
    },
    backgroundColor: bgColor,
  };

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

    // Buscar evolução de consultas dos últimos 7 dias
    const fetchConsultasPorPeriodo = async () => {
      try {
        const hoje = new Date();
        const inicio = format(subDays(hoje, 6), 'yyyy-MM-dd');
        const fim = format(hoje, 'yyyy-MM-dd');
        const response = await api.get('/relatorios/consultas', {
          params: { dataInicio: inicio, dataFim: fim }
        });
        setConsultasPorPeriodo(response.data.consultasPorPeriodo || []);
      } catch (error) {
        console.error('Erro ao buscar evolução de consultas:', error);
      }
    };
    fetchConsultasPorPeriodo();
  }, []);

  // Labels e dados reais para o gráfico de evolução (preenchendo dias sem consulta com zero)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Garante início do dia
  const dias = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(hoje, 6 - i);
    return format(d, 'yyyy-MM-dd');
  });
  const lineLabelsReais = dias.map(d => format(new Date(d), 'dd/MM'));
  const mapConsultas = new Map(consultasPorPeriodo.map(item => [item.data, item.quantidade]));
  const lineValuesReais = dias.map(d => mapConsultas.get(d) || 0);
  const lineDataReais = {
    labels: lineLabelsReais,
    datasets: [
      {
        label: 'Consultas',
        data: lineValuesReais,
        fill: true,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(25, 118, 210, 0.2)'
          : 'rgba(25, 118, 210, 0.15)',
        borderColor: theme.palette.primary.main,
        tension: 0.4,
        pointBackgroundColor: theme.palette.primary.main,
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  if (loading) {
    return (
      <Typography>Carregando...</Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Painel de Controle
        </Typography>
      </Box>
      <Grid container spacing={3} alignItems="stretch" justifyContent="center" sx={{ mb: 2 }}>
        {cardData(stats).map((card) => (
          <Grid item xs={12} sm={6} md={2.4} key={card.title}>
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
      {/* Gráfico de barras animado dos marcadores */}
      <Box sx={{ width: '100%', height: 320, my: 2 }}>
        <Bar data={barData} options={barOptions} />
      </Box>
      {/* Gráfico de rosca dos marcadores animado */}
      <Box sx={{ width: '100%', maxWidth: 480, height: 320, my: 2, mx: 'auto' }}>
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </Box>
      {/* Gráfico de área para evolução de consultas */}
      <Box sx={{ width: '100%', maxWidth: 900, height: 320, my: 2, mx: 'auto' }}>
        <Line data={lineDataReais} options={lineOptions} />
      </Box>
      <Box>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
          Bem-vindo, {user?.nome}! Aqui você pode acompanhar os principais indicadores do sistema.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;