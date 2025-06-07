import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Seleciona a logo conforme o tema
  const logoSrc = theme.palette.mode === 'dark' ? '/img/logo-dark.png' : '/img/logo-light.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(formData.email, formData.senha);
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setUser(response.data);
        if (response.data.perfil === 'superadmin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.background.default,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Efeito de partículas */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite',
          overflow: 'hidden',
          zIndex: 1,
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.2)', opacity: 0.8 },
            '100%': { transform: 'scale(1)', opacity: 0.5 },
          }
        }}
      />

      <Paper
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
          boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)',
          bgcolor: theme.palette.background.paper,
          zIndex: 2,
        }}
        elevation={4}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <img src={logoSrc} alt="Logo" style={{ width: 240, height: 240, objectFit: 'contain', marginBottom: 0 }} />
        </Box>
        <Typography variant="h5" align="center" gutterBottom fontWeight={700}>
          Bem-vindo ao PSPC
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2, mt: -1 }}>
          Sistema de proteção de crédito para provedores
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} autoComplete="off" mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha"
                name="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
                required
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ fontWeight: 700, mt: 1 }}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="text"
                color="primary"
                fullWidth
                sx={{ fontWeight: 600 }}
                onClick={() => navigate('/register-empresa')}
              >
                Não tem cadastro? Cadastrar empresa
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;