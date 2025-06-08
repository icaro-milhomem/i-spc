import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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

  const isEditing = Boolean(id);

  return (
    <Box sx={{ mt: -6, display: 'flex', justifyContent: 'center', background: theme.palette.background.default, minHeight: '100vh' }}>
      <Box sx={{ width: '100%', minWidth: 544, maxWidth: 1044, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
          {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nome *"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                fullWidth
                required
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email *"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Senha"
                name="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
                fullWidth
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Papel"
                name="perfil"
                value={formData.perfil}
                onChange={handleChange}
                fullWidth
                required
                select
                sx={{ borderRadius: 2, color: theme.palette.text.primary }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              >
                <MenuItem value="admin">Administrador</MenuItem>
                <MenuItem value="usuario">Usuário</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  type="checkbox"
                  id="ativo"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={e => setFormData(prev => ({ ...prev, ativo: e.target.checked }))}
                  style={{ width: 20, height: 20 }}
                />
                <label htmlFor="ativo" style={{ color: theme.palette.text.primary, fontWeight: 500, fontSize: 16 }}>
                  Ativo
                </label>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, borderRadius: 2, fontWeight: 700, fontSize: 18 }}
              >
                {isEditing ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Snackbar
          open={success}
          autoHideDuration={2000}
          onClose={() => setSuccess(false)}
          message="Usuário salvo com sucesso!"
        />
      </Box>
    </Box>
  );
};

export default UsuarioEdicao;