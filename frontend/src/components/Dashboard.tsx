import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
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
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, Logout as LogoutIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Cliente {
  id: number;
  cpf: string;
  nome: string;
  telefone: string;
  status: string;
}

interface Divida {
  id: number;
  descricao: string;
  valor: number;
  data: string;
  status: string;
}

interface ConsultaResult {
  cliente: Cliente | null;
  dividas: Divida[];
  data_consulta: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<ConsultaResult | null>(null);
  const [estatisticas, setEstatisticas] = useState({
    totalClientes: 0,
    inadimplentes: 0,
    consultasHoje: 0,
  });

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const response = await api.get('/estatisticas');
      setEstatisticas(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleSearch = async () => {
    if (!cpf || cpf.length !== 11) {
      setError('CPF inválido');
      return;
    }

    setError('');
    setLoading(true);
    setResultado(null);

    try {
      const response = await api.get(`/consulta/${cpf}`);
      setResultado(response.data);
      carregarEstatisticas();
    } catch (error) {
      setError('Erro ao consultar CPF');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Cabeçalho */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography component="h1" variant="h4" color="primary" gutterBottom>
                  P-SPC
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Proteção de Crédito para Provedores
                </Typography>
              </Box>
              <IconButton color="primary" onClick={handleLogout} title="Sair">
                <LogoutIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>

        {/* Busca de CPF */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Consulta de CPF
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="CPF"
                variant="outlined"
                value={cpf}
                onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                placeholder="Digite o CPF (apenas números)"
                error={!!error}
                helperText={error}
                disabled={loading}
              />
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                onClick={handleSearch}
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
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Resultado da Consulta
              </Typography>
              
              {resultado.cliente ? (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Cliente: {resultado.cliente.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CPF: {resultado.cliente.cpf}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {resultado.cliente.status}
                  </Typography>

                  {resultado.dividas.length > 0 && (
                    <TableContainer sx={{ mt: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Valor</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {resultado.dividas.map((divida) => (
                            <TableRow key={divida.id}>
                              <TableCell>{divida.descricao}</TableCell>
                              <TableCell>R$ {divida.valor.toFixed(2)}</TableCell>
                              <TableCell>{new Date(divida.data).toLocaleDateString()}</TableCell>
                              <TableCell>{divida.status}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              ) : (
                <Alert severity="info">
                  Nenhum registro encontrado para este CPF
                </Alert>
              )}
            </Paper>
          </Grid>
        )}

        {/* Cards de Estatísticas */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total de Clientes
            </Typography>
            <Typography component="p" variant="h4">
              {estatisticas.totalClientes}
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
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Inadimplentes
            </Typography>
            <Typography component="p" variant="h4">
              {estatisticas.inadimplentes}
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
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Consultas Hoje
            </Typography>
            <Typography component="p" variant="h4">
              {estatisticas.consultasHoje}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 