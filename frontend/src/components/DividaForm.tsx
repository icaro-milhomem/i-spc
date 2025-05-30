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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import api from '../services/api';

interface Divida {
  id?: number;
  clienteId: number | '';
  valor: number;
  dataVencimento: string;
  status: string;
  descricao: string;
  ativo: boolean;
}

interface Cliente {
  id: number;
  nome: string;
}

const DividaForm: React.FC = () => {
  const { id: clienteId, idDivida } = useParams<{ id: string; idDivida?: string }>();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState<Divida>({
    clienteId: '',
    valor: 0,
    dataVencimento: new Date().toISOString().split('T')[0],
    status: 'PENDENTE',
    descricao: '',
    ativo: true
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const inicializar = async () => {
      try {
        await carregarClientes();
        if (idDivida && idDivida !== 'nova') {
          await carregarDivida();
        }
      } catch (error) {
        console.error('Erro ao inicializar:', error);
      } finally {
        setLoading(false);
      }
    };

    inicializar();
  }, [idDivida]);

  const carregarClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data.data);
      if (!idDivida && response.data.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          clienteId: response.data.data[0].id
        }));
      }
    } catch (error) {
      setError('Erro ao carregar clientes');
      console.error('Erro:', error);
    }
  };

  const carregarDivida = async () => {
    try {
      const response = await api.get(`/dividas/${idDivida}`);
      // Converte status para maiúsculo para o Select e garante que ativo seja booleano
      setFormData({
        ...response.data,
        status: response.data.status ? response.data.status.toUpperCase() : 'PENDENTE',
        ativo: Boolean(response.data.ativo),
        dataVencimento: response.data.data_vencimento ? new Date(response.data.data_vencimento).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        navigate(`/clientes/${clienteId}/dividas`);
        return;
      }
      setError('Erro ao carregar dados da dívida');
      console.error('Erro:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Evita duplo submit
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        cliente_id: formData.clienteId,
        valor: formData.valor,
        data_vencimento: formData.dataVencimento,
        status: formData.status.toLowerCase(), // Converte para minúsculo
        descricao: formData.descricao,
        ativo: formData.ativo
      };
      if (idDivida && idDivida !== 'nova') {
        await api.put(`/dividas/${idDivida}`, payload);
      } else {
        await api.post('/dividas', payload);
      }
      setSuccess(true);
      setTimeout(() => {
        navigate(`/clientes/${formData.clienteId}/dividas`);
      }, 2000);
    } catch (error) {
      setError('Erro ao salvar dívida');
      console.error('Erro:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string | number>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name as string]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Typography>Carregando...</Typography>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {idDivida && idDivida !== 'nova' ? 'Editar Dívida' : 'Nova Dívida'}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    name="clienteId"
                    value={formData.clienteId || ''}
                    onChange={handleChange}
                    required
                  >
                    {clientes.map(cliente => (
                      <MenuItem key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Valor"
                  name="valor"
                  type="number"
                  value={formData.valor}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Data de Vencimento"
                  name="dataVencimento"
                  type="date"
                  value={formData.dataVencimento}
                  onChange={handleChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="PENDENTE">Pendente</MenuItem>
                    <MenuItem value="PAGO">Pago</MenuItem>
                    <MenuItem value="CANCELADO">Cancelado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  multiline
                  rows={4}
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
                  label="Ativo"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={submitting}
                >
                  {submitting ? 'Salvando...' : 'Salvar'}
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
            message="Dívida salva com sucesso!"
          />
        </Paper>
      )}
    </Box>
  );
};

export default DividaForm;