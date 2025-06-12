import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch,
  Grid
} from '@mui/material';
import api from '../services/api';
import { formatCPF, formatPhone } from '../utils/formatters';
import { validateCPF } from '../utils/validators';
import { useTheme } from '@mui/material/styles';
import { formatCEP } from '../utils/cep';
import { Add as AddIcon } from '@mui/icons-material';

interface ClienteForm {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  ativo: boolean;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  tenant?: {
    id: number;
    nome: string;
    cnpj: string;
  };
  permissoes?: {
    podeEditar: boolean;
    podeExcluir: boolean;
  };
}

const ClienteForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const theme = useTheme();

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
    estado: '',
    tenant: undefined,
    permissoes: undefined
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
        estado: cliente.estado,
        tenant: cliente.tenant,
        permissoes: cliente.permissoes
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

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      cep: formatCEP(cep)
    }));
  };

  const handleCepBlur = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, '');
    console.log('CEP limpo:', cepLimpo);
    
    if (cepLimpo.length !== 8) {
      console.log('CEP inválido: deve ter 8 dígitos');
      return;
    }

    try {
      console.log('Buscando CEP:', cepLimpo);
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      console.log('Resposta da API:', data);

      if (data.erro) {
        console.log('CEP não encontrado');
        setError('CEP não encontrado');
        return;
      }

      setFormData(prev => ({
        ...prev,
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }));
    } catch (e) {
      console.error('Erro ao buscar CEP:', e);
      setError('Erro ao buscar CEP. Tente novamente.');
    }
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
    if (!formData.cep.trim()) {
      setError('CEP é obrigatório');
      return false;
    }
    if (!formData.rua.trim()) {
      setError('Rua é obrigatória');
      return false;
    }
    if (!formData.numero.trim()) {
      setError('Número é obrigatório');
      return false;
    }
    if (!formData.bairro.trim()) {
      setError('Bairro é obrigatório');
      return false;
    }
    if (!formData.cidade.trim()) {
      setError('Cidade é obrigatória');
      return false;
    }
    if (!formData.estado.trim()) {
      setError('Estado é obrigatório');
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
      const enderecoString = [
        formData.cep,
        formData.rua,
        formData.numero,
        formData.complemento,
        formData.bairro,
        formData.cidade,
        formData.estado
      ].join(', ');

      const data = {
        nome: formData.nome,
        cpf: formData.cpf.replace(/\D/g, ''),
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''),
        ativo: formData.ativo,
        endereco: enderecoString
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

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ mt: -6, display: 'flex', justifyContent: 'center', background: theme.palette.background.default, minHeight: '100vh' }}>
      <Box sx={{ width: '100%', minWidth: 544, maxWidth: 1044, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
          {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={1}>
            <Grid container spacing={1} sx={{ mt: 1, mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nome * *"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CPF * *"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email * *"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone * *"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={1} sx={{ mt: 1, mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="CEP"
                  name="cep"
                  value={formData.cep}
                  onChange={handleCepChange}
                  onBlur={handleCepBlur}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Rua"
                  name="rua"
                  value={formData.rua}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Número"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Complemento"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={handleChange}
                    name="ativo"
                    color="primary"
                  />
                }
                label="Ativo"
                sx={{ color: theme.palette.text.primary }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  size="large"
                  sx={{ borderRadius: 2, fontWeight: 700, fontSize: 18, px: 4, py: 1 }}
                >
                  Atualizar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClienteForm; 