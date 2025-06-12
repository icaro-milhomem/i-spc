import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Debito {
  id: number;
  nome_devedor: string;
  cpf_cnpj_devedor: string;
  valor: string;
  descricao: string;
  data_cadastro: string;
  protocolo: string;
  empresa: string;
  cnpj_empresa: string;
  status_negativado: boolean;
  data_vencimento: string;
  podeEditar: boolean;
  tenant: {
    id: number;
    nome: string;
    cnpj: string;
    logo: string;
  };
}

const DebitosList: React.FC = () => {
  const [debitos, setDebitos] = useState<Debito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  const fetchDebitos = async () => {
    try {
      console.log('📊 Buscando débitos...');
      const response = await api.get('/debitos');
      console.log('✅ Débitos carregados:', response.data);
      setDebitos(response.data.data);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao carregar débitos:', err);
      setError('Erro ao carregar débitos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebitos();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este débito?')) return;

    try {
      console.log('🗑️ Excluindo débito:', id);
      await api.delete(`/debitos/${id}`);
      console.log('✅ Débito excluído com sucesso');
      
      // Atualiza a lista removendo o item excluído
      setDebitos(prevDebitos => prevDebitos.filter(debito => debito.id !== id));
      showSnackbar('Débito excluído com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao excluir débito:', err);
      showSnackbar('Erro ao excluir débito. Tente novamente.', 'error');
    }
  };

  const handleNegativar = async (id: number) => {
    try {
      console.log('🔄 Negativando débito:', id);
      await api.put(`/debitos/${id}/negativar`);
      console.log('✅ Débito negativado com sucesso');
      
      // Atualiza a lista atualizando o status do débito
      setDebitos(prevDebitos => 
        prevDebitos.map(debito => 
          debito.id === id 
            ? { ...debito, status_negativado: true }
            : debito
        )
      );
      showSnackbar('Débito negativado com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao negativar débito:', err);
      showSnackbar('Erro ao negativar débito. Tente novamente.', 'error');
    }
  };

  const handleDesnegativar = async (id: number) => {
    try {
      console.log('🔄 Desnegativando débito:', id);
      await api.put(`/debitos/${id}/desnegativar`);
      console.log('✅ Débito desnegativado com sucesso');
      
      // Atualiza a lista atualizando o status do débito
      setDebitos(prevDebitos => 
        prevDebitos.map(debito => 
          debito.id === id 
            ? { ...debito, status_negativado: false }
            : debito
        )
      );
      showSnackbar('Débito desnegativado com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao desnegativar débito:', err);
      showSnackbar('Erro ao desnegativar débito. Tente novamente.', 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={fetchDebitos}
          sx={{ mt: 2 }}
        >
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Débitos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/debitos/novo')}
        >
          Novo Débito
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Protocolo</TableCell>
              <TableCell>Devedor</TableCell>
              <TableCell>CPF/CNPJ</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debitos.map((debito) => (
              <TableRow key={debito.id}>
                <TableCell>{debito.protocolo}</TableCell>
                <TableCell>{debito.nome_devedor}</TableCell>
                <TableCell>{debito.cpf_cnpj_devedor}</TableCell>
                <TableCell>{formatCurrency(debito.valor)}</TableCell>
                <TableCell>
                  <Tooltip title={debito.descricao}>
                    <Typography sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {debito.descricao}
                    </Typography>
                  </Tooltip>
                </TableCell>
                <TableCell>{formatDate(debito.data_vencimento)}</TableCell>
                <TableCell>
                  <Chip
                    label={debito.status_negativado ? 'Negativado' : 'Pendente'}
                    color={debito.status_negativado ? 'error' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {debito.podeEditar && (
                      <>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/debitos/${debito.id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(debito.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        {!debito.status_negativado ? (
                          <Tooltip title="Negativar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleNegativar(debito.id)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Desnegativar">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleDesnegativar(debito.id)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DebitosList;