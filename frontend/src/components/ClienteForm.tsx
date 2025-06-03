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
  FormControlLabel,
  Switch
} from '@mui/material';
import api from '../services/api';
import { formatCPF, formatPhone } from '../utils/formatters';
import { validateCPF } from '../utils/validators';

interface ClienteForm {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  ativo: boolean;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

const ClienteForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<ClienteForm>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    ativo: true,
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (isEditing) {
      carregarCliente();
    }
  }, [id]);

  const carregarCliente = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/clientes/${id}`);
      const cliente = response.data;
      setFormData({
        nome: cliente.nome,
        cpf: cliente.cpf,
        email: cliente.email,
        telefone: cliente.telefone,
        ativo: cliente.ativo,
        cep: cliente.cep,
        rua: cliente.rua,
        numero: cliente.numero,
        complemento: cliente.complemento,
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        estado: cliente.estado
      });
    } catch (err) {
      setError('Erro ao carregar cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ativo' ? checked : value
    }));
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cpf = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      cpf: formatCPF(cpf)
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      telefone: formatPhone(phone)
    }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.cpf.trim()) {
      setError('CPF é obrigatório');
      return false;
    }
    if (!validateCPF(formData.cpf)) {
      setError('CPF inválido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!formData.telefone.trim()) {
      setError('Telefone é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const data = {
        nome: formData.nome,
        cpf: formData.cpf.replace(/\D/g, ''),
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''),
        ativo: formData.ativo,
        cep: formData.cep,
        rua: formData.rua,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado
      };

      if (isEditing) {
        await api.put(`/clientes/${id}`, data);
        setSnackbar({
          open: true,
          message: 'Cliente atualizado com sucesso',
          severity: 'success'
        });
      } else {
        await api.post('/clientes', data);
        setSnackbar({
          open: true,
          message: 'Cliente criado com sucesso',
          severity: 'success'
        });
      }
      navigate('/clientes');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error && err.response.data.error.toLowerCase().includes('cpf')) {
        setError('CPF já em uso');
      } else {
        setError('Erro ao salvar cliente');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const buscarCep = async () => {
    if (!formData.cep || formData.cep.length < 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${formData.cep.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      if (data.erro) {
        setError('CEP não encontrado');
        setFormData(prev => ({ ...prev, rua: '', bairro: '', cidade: '', estado: '' }));
      } else {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }));
      }
    } catch (e) {
      setError('Erro ao buscar CEP');
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, minWidth: 450, maxWidth: 600, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        </Typography>
        <form onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nome *"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CPF *"
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email *"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone *"
                name="telefone"
                value={formData.telefone}
                onChange={handlePhoneChange}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={handleChange}
                    name="ativo"
                  />
                }
                label="Ativo"
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                onBlur={buscarCep}
                fullWidth
                sx={{ borderRadius: 2 }}
                helperText="Digite o CEP e saia do campo para buscar automaticamente"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Rua"
                name="rua"
                value={formData.rua}
                onChange={handleChange}
                fullWidth
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                fullWidth
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                fullWidth
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                fullWidth
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                fullWidth
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                fullWidth
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ mt: 2, borderRadius: 2, fontWeight: 700, fontSize: 18 }}
                disabled={loading}
              >
                {loading ? (isEditing ? 'Salvando...' : 'Cadastrando...') : (isEditing ? 'Salvar' : 'Cadastrar')}
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
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ClienteForm; 