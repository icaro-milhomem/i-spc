import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { validateEmail, validatePassword } from '../utils/validators';

const UsuarioCadastro: React.FC = () => {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('operador');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validações
      if (!nome || !email || !senha || !perfil) {
        throw new Error('Todos os campos são obrigatórios');
      }

      if (!validateEmail(email)) {
        throw new Error('Email inválido');
      }

      if (!validatePassword(senha)) {
        throw new Error('A senha deve ter no mínimo 6 caracteres, incluindo letras e números');
      }

      await api.post('/usuarios', {
        nome,
        email,
        senha,
        perfil,
      });

      setSuccess('Usuário cadastrado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setPerfil('operador');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.perfil !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Acesso negado. Apenas administradores podem acessar esta página.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Cadastro de Usuário
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            margin="normal"
            required
            disabled={loading}
            helperText="Mínimo 6 caracteres, incluindo letras e números"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Perfil</InputLabel>
            <Select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              label="Perfil"
              required
              disabled={loading}
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="operador">Operador</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UsuarioCadastro; 