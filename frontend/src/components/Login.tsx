import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail } from '../utils/validators';
import logo from '../../logo.login.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Email inválido');
      return;
    }

    if (!formData.senha) {
      setError('Senha é obrigatória');
      return;
    }

    try {
      setLoading(true);
      console.log('Tentando fazer login com:', formData.email);
      await signIn(formData.email, formData.senha);
      console.log('Login bem sucedido');
      navigate('/dashboard');
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        bgcolor: '#f5f6fa',
        pt: 6
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 420,
          borderRadius: 4,
          boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
          <img src={logo} alt="Logo" style={{ width: '100%', maxWidth: 220, marginBottom: 4 }} />
        </Box>
        <Typography variant="subtitle1" align="center" sx={{ mb: 1, color: '#222', fontWeight: 500 }}>
          Bem vindo(a) ao PSPC.
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ borderRadius: 2 }}
          />
          <TextField
            fullWidth
            label="Senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ borderRadius: 2 }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, borderRadius: 2, fontWeight: 700, fontSize: 18 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/recuperar-senha')}
              sx={{ color: '#1976d2', fontWeight: 600 }}
            >
              Esqueceu sua senha?
            </Link>
          </Box>
        </form>
      </Paper>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login; 