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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
  const [enderecoDialogOpen, setEnderecoDialogOpen] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

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

  const handleNovoEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoEndereco(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNovoEnderecoSubmit = async () => {
    try {
      await api.post(`/enderecos/cliente/${id}`, novoEndereco);
      setSnackbar({
        open: true,
        message: 'Endereço adicionado com sucesso!',
        severity: 'success'
      });
      setEnderecoDialogOpen(false);
      setNovoEndereco({
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: ''
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Erro ao adicionar endereço',
        severity: 'error'
      });
    }
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
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, minWidth: 400, maxWidth: 600, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <TextField
            label="Nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          <TextField
            label="CPF"
            name="cpf"
            value={formData.cpf}
            onChange={handleCPFChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          {formData.tenant && (
            <>
              <TextField
                label="Empresa"
                value={formData.tenant.nome}
                fullWidth
                margin="normal"
                disabled
              />
              <TextField
                label="CNPJ da Empresa"
                value={formData.tenant.cnpj}
                fullWidth
                margin="normal"
                disabled
              />
            </>
          )}
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          <TextField
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handlePhoneChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.ativo}
                onChange={handleChange}
                name="ativo"
                color="primary"
                disabled={isEditing && !formData.permissoes?.podeEditar}
              />
            }
            label="Ativo"
          />
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
            Endereço Principal
          </Typography>
          <TextField
            label="CEP"
            name="cep"
            value={formData.cep}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          <TextField
            label="Rua"
            name="rua"
            value={formData.rua}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          <TextField
            label="Número"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          <TextField
            label="Complemento"
            name="complemento"
            value={formData.complemento}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
          />
          <TextField
            label="Bairro"
            name="bairro"
            value={formData.bairro}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          <TextField
            label="Cidade"
            name="cidade"
            value={formData.cidade}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          <TextField
            label="Estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={isEditing && !formData.permissoes?.podeEditar}
            required
          />
          {isEditing && !formData.permissoes?.podeEditar && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => setEnderecoDialogOpen(true)}
            >
              Adicionar Novo Endereço
            </Button>
          )}
          {formData.permissoes?.podeEditar && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, borderRadius: 2, fontWeight: 700, fontSize: 18 }}
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={enderecoDialogOpen} onClose={() => setEnderecoDialogOpen(false)}>
        <DialogTitle>Adicionar Novo Endereço</DialogTitle>
        <DialogContent>
          <TextField
            label="CEP"
            name="cep"
            value={novoEndereco.cep}
            onChange={handleNovoEnderecoChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Rua"
            name="rua"
            value={novoEndereco.rua}
            onChange={handleNovoEnderecoChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Número"
            name="numero"
            value={novoEndereco.numero}
            onChange={handleNovoEnderecoChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Complemento"
            name="complemento"
            value={novoEndereco.complemento}
            onChange={handleNovoEnderecoChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Bairro"
            name="bairro"
            value={novoEndereco.bairro}
            onChange={handleNovoEnderecoChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Cidade"
            name="cidade"
            value={novoEndereco.cidade}
            onChange={handleNovoEnderecoChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Estado"
            name="estado"
            value={novoEndereco.estado}
            onChange={handleNovoEnderecoChange}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnderecoDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleNovoEnderecoSubmit} variant="contained" color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClienteForm; 