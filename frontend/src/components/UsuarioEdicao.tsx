import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import api from '../services/api';

interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  ativo: boolean;
}

const UsuarioEdicao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Usuario>({
    nome: '',
    email: '',
    senha: '',
    ativo: true
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      carregarUsuario();
    }
  }, [id]);

  const carregarUsuario = async () => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      setFormData(response.data);
    } catch (error) {
      setError('Erro ao carregar dados do usuário');
      console.error('Erro:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/usuarios/${id}`, formData);
      } else {
        await api.post('/usuarios', formData);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/usuarios');
      }, 2000);
    } catch (error) {
      setError('Erro ao salvar usuário');
      console.error('Erro:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Editar Usuário' : 'Novo Usuário'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
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
                required={!id}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
              >
                Salvar
              </Button>
            </Grid>
          </Grid>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Snackbar
          open={success}
          autoHideDuration={2000}
          onClose={() => setSuccess(false)}
          message="Usuário salvo com sucesso!"
        />
      </Paper>
    </Box>
  );
};

export default UsuarioEdicao; 