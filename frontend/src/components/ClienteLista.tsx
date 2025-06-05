import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { formatCPF } from '../utils/formatters';
import api from '../services/api';
import { Pagination } from './Pagination';

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  ativo: boolean;
  permissoes: {
    podeEditar: boolean;
    podeExcluir: boolean;
    podeAdicionarEndereco: boolean;
    podeAdicionarDivida: boolean;
  };
}

interface PaginatedResponse<T> {
  clientes: T[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const ClienteLista: React.FC = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [clienteBusca, setClienteBusca] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClientes = async () => {
    try {
      const response = await api.get<PaginatedResponse<Cliente>>('/clientes', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setClientes(response.data.clientes);
      setTotalItems(response.data.total);
    } catch (err) {
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [page, rowsPerPage]);

  const handleDeleteClick = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCliente) return;

    try {
      await api.delete(`/clientes/${selectedCliente.id}`);
      setSuccessMessage('Cliente excluído com sucesso!');
      fetchClientes();
    } catch (err) {
      setError('Erro ao excluir cliente');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedCliente(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCliente(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleSearchClick = (cliente: Cliente) => {
    setClienteBusca(cliente);
    setSearchDialogOpen(true);
  };

  const handleSearchDialogClose = () => {
    setSearchDialogOpen(false);
    setClienteBusca(null);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    setPage(0);
    fetchClientes();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredClientes = clientes.filter(cliente => {
    const term = searchTerm.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(term) ||
      cliente.email.toLowerCase().includes(term) ||
      cliente.telefone.toLowerCase().includes(term) ||
      cliente.cpf.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Box sx={{ p: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 1200, p: 4, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', flex: 1 }}>
            Clientes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/clientes/novo')}
            sx={{ ml: 2, borderRadius: 3, fontWeight: 700, fontSize: 16, px: 3, py: 1.2, boxShadow: '0 2px 8px #1976d220' }}
          >
            Novo Cliente
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
          <TextField
            label="Buscar cliente"
            variant="outlined"
            size="medium"
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyDown}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ width: 350, borderRadius: 2, background: '#fff' }}
          />
        </Box>
        <TableContainer component={Box} sx={{ borderRadius: 3, boxShadow: '0 2px 8px #1976d210' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Nome</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Telefone</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>CPF</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ color: '#fff', fontWeight: 700 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClientes.map((cliente, idx) => (
                <TableRow key={cliente.id} sx={{ background: idx % 2 === 0 ? '#f5f6fa' : '#fff' }}>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.email}</TableCell>
                  <TableCell>{cliente.telefone}</TableCell>
                  <TableCell>{formatCPF(cliente.cpf)}</TableCell>
                  <TableCell>
                    <Chip
                      label={cliente.ativo ? 'Ativo' : 'Inativo'}
                      color={cliente.ativo ? 'success' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: 13 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {cliente.permissoes.podeEditar && (
                      <Tooltip title="Editar">
                        <IconButton color="primary" onClick={() => navigate(`/clientes/${cliente.id}`)} size="large">
                          <EditIcon fontSize="medium" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Dívidas">
                      <IconButton color="primary" onClick={() => navigate(`/clientes/${cliente.id}/dividas`)} size="large">
                        <ReceiptIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Consultar">
                      <IconButton color="primary" onClick={() => handleSearchClick(cliente)} size="large">
                        <SearchIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                    {cliente.permissoes.podeExcluir && (
                      <Tooltip title="Excluir">
                        <IconButton color="error" onClick={() => handleDeleteClick(cliente)} size="large">
                          <DeleteIcon fontSize="medium" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            totalItems={totalItems}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TableContainer>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir o cliente {selectedCliente?.nome}?
              Esta ação não pode ser desfeita e excluirá também todas as dívidas associadas.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancelar</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Excluir
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={searchDialogOpen} onClose={handleSearchDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Consulta de Cliente</DialogTitle>
          <DialogContent>
            {clienteBusca ? (
              <Box>
                <Typography variant="subtitle1"><strong>Nome:</strong> {clienteBusca.nome}</Typography>
                <Typography variant="subtitle1"><strong>Email:</strong> {clienteBusca.email}</Typography>
                <Typography variant="subtitle1"><strong>Telefone:</strong> {clienteBusca.telefone}</Typography>
                <Typography variant="subtitle1"><strong>CPF:</strong> {formatCPF(clienteBusca.cpf)}</Typography>
                <Typography variant="subtitle1"><strong>Status:</strong> {clienteBusca.ativo ? 'Ativo' : 'Inativo'}</Typography>
              </Box>
            ) : (
              <Typography>Carregando...</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSearchDialogClose} color="primary">Fechar</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!error || !!successMessage}
          autoHideDuration={6000}
          onClose={() => {
            setError(null);
            setSuccessMessage(null);
          }}
        >
          <Alert
            onClose={() => {
              setError(null);
              setSuccessMessage(null);
            }}
            severity={error ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {error || successMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default ClienteLista; 