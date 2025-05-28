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

interface Cliente {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  ativo: boolean;
}

const ClienteEdicao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Cliente>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    ativo: true
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      api.get(`/clientes/${id}`)
        .then(response => {
          setFormData(response.data);
        })
        .catch(error => {
          setError('Erro ao carregar dados do cliente');
          console.error('Erro:', error);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/clientes/${id}`, formData);
      } else {
        await api.post('/clientes', formData);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/clientes');
      }, 2000);
    } catch (error) {
      setError('Erro ao salvar cliente');
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
          {id ? 'Editar Cliente' : 'Novo Cliente'}
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
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                required
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
          message="Cliente salvo com sucesso!"
        />
      </Paper>
    </Box>
  );
};

export default ClienteEdicao; 