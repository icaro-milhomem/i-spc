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

  const [buscandoCep, setBuscandoCep] = useState(false);

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
    setBuscandoCep(true);
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
    } finally {
      setBuscandoCep(false);
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                required
                inputProps={{ maxLength: 14 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handlePhoneChange}
                required
                inputProps={{ maxLength: 15 }}
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

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                onBlur={buscarCep}
                inputProps={{ maxLength: 9 }}
                required
                helperText="Digite o CEP e saia do campo para buscar automaticamente"
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <Button
                variant="outlined"
                onClick={buscarCep}
                disabled={buscandoCep || !formData.cep || formData.cep.length < 8}
                sx={{ mt: { xs: 2, sm: 0 } }}
              >
                {buscandoCep ? 'Buscando...' : 'Buscar CEP'}
              </Button>
            </Grid>

            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Rua"
                name="rua"
                value={formData.rua}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
                inputProps={{ maxLength: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={handleChange}
                    name="ativo"
                  />
                }
                label="Cliente Ativo"
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/clientes')}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {isEditing ? 'Atualizar' : 'Criar'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClienteForm; 