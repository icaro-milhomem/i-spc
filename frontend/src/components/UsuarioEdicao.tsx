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
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import api from '../services/api';

interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  ativo: boolean;
  perfil?: string;
}

const UsuarioEdicao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Usuario>({
    nome: '',
    email: '',
    senha: '',
    ativo: true,
    perfil: 'usuario',
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
      const usuario = response.data;
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '', // Sempre inicializa com string vazia
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
        perfil: usuario.papeis && usuario.papeis.length > 0 ? usuario.papeis[0].nome : (usuario.perfil || 'usuario'),
      });
    } catch (error) {
      setError('Erro ao carregar dados do usuário');
      console.error('Erro:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dadosParaEnviar = { ...formData };
      // Se estiver editando e a senha estiver vazia, remove o campo
      if (id && !dadosParaEnviar.senha) {
        delete dadosParaEnviar.senha;
      }

      if (id) {
        await api.put(`/usuarios/${id}`, dadosParaEnviar);
      } else {
        await api.post('/usuarios', dadosParaEnviar);
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

  const handlePerfilChange = (e: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      perfil: e.target.value
    }));
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, minWidth: 400, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          {id ? 'Editar Usuário' : 'Novo Usuário'}
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome *"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Senha *"
                name="senha"
                type="password"
                value={formData.senha || ''}
                onChange={handleChange}
                required={!id}
                helperText={id ? "Deixe em branco para manter a senha atual" : "Obrigatório para novo usuário"}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" sx={{ borderRadius: 2 }}>
                <InputLabel>Papel</InputLabel>
                <Select
                  name="perfil"
                  value={formData.perfil}
                  onChange={handlePerfilChange}
                  label="Papel"
                  required
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="admin">Administrador</MenuItem>
                  <MenuItem value="usuario">Usuário</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, borderRadius: 2, fontWeight: 700, fontSize: 18 }}
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