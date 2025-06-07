import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
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
  Paper
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';
import { Pagination } from './Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Divida {
  id: number;
  valor: number;
  descricao: string;
  data_vencimento: string;
  status: string;
  created_at: string;
  podeEditar: boolean;
  tenant: {
    id: number;
    nome: string;
    cnpj: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const DividaLista: React.FC = () => {
  const { id: clienteId } = useParams<{ id: string }>();
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDivida, setSelectedDivida] = useState<Divida | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

  const fetchDividas = async () => {
    try {
      setLoading(true);
      const response = await api.get<PaginatedResponse<Divida>>(`/clientes/${clienteId}/dividas`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setDividas(response.data.data);
      setTotalItems(response.data.total);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dívidas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDividas();
  }, [clienteId, page, rowsPerPage]);

  const handleDeleteClick = (divida: Divida) => {
    setSelectedDivida(divida);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDivida) return;
    try {
      await api.delete(`/dividas/${selectedDivida.id}`);
      setSuccessMessage('Dívida excluída com sucesso!');
      fetchDividas();
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setSuccessMessage('Dívida já foi excluída ou não existe. Lista atualizada.');
        setError(null);
        fetchDividas();
      } else {
        setError('Erro ao excluir dívida. Tente novamente.');
      }
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDivida(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDivida(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'success';
      case 'atrasado':
        return 'error';
      default:
        return 'warning';
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

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
          Dívidas do Cliente
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`/clientes/${clienteId}/dividas/nova`)}
        >
          Nova Dívida
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Valor</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dividas.map((divida) => (
              <TableRow key={divida.id}>
                <TableCell>{formatCurrency(divida.valor)}</TableCell>
                <TableCell>{divida.descricao}</TableCell>
                <TableCell>{formatDate(divida.data_vencimento)}</TableCell>
                <TableCell>
                  <Chip
                    label={(divida.status || '').toUpperCase()}
                    color={getStatusColor(divida.status || '')}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: 13 }}
                  />
                </TableCell>
                <TableCell>{formatDate(divida.created_at)}</TableCell>
                <TableCell align="right">
                  {divida.podeEditar && (
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/clientes/${clienteId}/dividas/${divida.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {divida.podeEditar && (
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(divida)}
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
            Tem certeza que deseja excluir esta dívida?
            Esta ação não pode ser desfeita.
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

export default DividaLista;