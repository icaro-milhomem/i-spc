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
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
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
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get<PaginatedResponse<Cliente>>('/clientes', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setClientes(response.data.clientes);
      setTotalItems(response.data.total);
      setError(null);
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

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
    return <Typography>Carregando...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clientes/novo')}
        >
          Novo Cliente
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'flex-end' }}>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={handleSearchInputChange}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 16,
            width: 260,
            marginRight: 8
          }}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>CPF</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClientes.map((cliente) => (
              <TableRow key={cliente.id}>
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
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/clientes/${cliente.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/clientes/${cliente.id}/dividas`)}
                  >
                    <ReceiptIcon />
                  </IconButton>
                  {cliente.permissoes.podeExcluir && (
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(cliente)}
                    >
                      <DeleteIcon />
                    </IconButton>
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
    </Box>
  );
};

export default ClienteLista; 