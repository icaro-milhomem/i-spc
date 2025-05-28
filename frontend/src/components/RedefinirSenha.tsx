import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export const RedefinirSenha: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [formData, setFormData] = useState({
    senha: '',
    confirmarSenha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/redefinir-senha', {
        token,
        senha: formData.senha,
      });
      setSuccess('Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError('Erro ao redefinir senha. O token pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Redefinir Senha
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph align="center">
            Digite sua nova senha.
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nova Senha"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
            />
            <TextField
              fullWidth
              label="Confirmar Nova Senha"
              name="confirmarSenha"
              type="password"
              value={formData.confirmarSenha}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 