import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export const Perfil: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put('/usuarios/me', {
        nome: formData.nome,
        email: formData.email,
      });

      updateUser(response.data);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.novaSenha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await api.put('/usuarios/me/senha', {
        senhaAtual: formData.senhaAtual,
        novaSenha: formData.novaSenha,
      });

      setSuccess('Senha atualizada com sucesso!');
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      }));
    } catch (err) {
      setError('Erro ao atualizar senha. Verifique se a senha atual está correta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dados Pessoais
              </Typography>
              <form onSubmit={handleUpdateProfile}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  Atualizar Dados
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alterar Senha
              </Typography>
              <form onSubmit={handleUpdatePassword}>
                <TextField
                  fullWidth
                  label="Senha Atual"
                  name="senhaAtual"
                  type="password"
                  value={formData.senhaAtual}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Nova Senha"
                  name="novaSenha"
                  type="password"
                  value={formData.novaSenha}
                  onChange={handleChange}
                  margin="normal"
                  required
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
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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