import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Pagination } from './Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';

interface Divida {
  id: number;
  cliente_id: number;
  valor: number;
  descricao: string;
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado';
  created_at: string;
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
      const response = await api.get<PaginatedResponse<Divida>>(`/clientes/${clienteId}/dividas`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setDividas(response.data.data);
      setTotalItems(response.data.total);
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
    <Box sx={{ p: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 1200, p: 4, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', flex: 1 }}>
            Dívidas do Cliente
          </Typography>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/clientes/${clienteId}/dividas/nova`)}
              sx={{ borderRadius: 3, fontWeight: 700, fontSize: 16, px: 3, py: 1.2, boxShadow: '0 2px 8px #1976d220' }}
            >
              Nova Dívida
            </Button>
          </Box>
        </Box>
        <TableContainer component={Box} sx={{ borderRadius: 3, boxShadow: '0 2px 8px #1976d210' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Valor</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Descrição</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Vencimento</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Data de Criação</TableCell>
                <TableCell align="right" sx={{ color: '#fff', fontWeight: 700 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dividas.map((divida, idx) => (
                <TableRow key={divida.id} sx={{ background: idx % 2 === 0 ? '#f5f6fa' : '#fff' }}>
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
                    <Tooltip title="Editar">
                      <IconButton color="primary" onClick={() => navigate(`/clientes/${clienteId}/dividas/${divida.id}`)} size="large">
                        <EditIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton color="error" onClick={() => handleDeleteClick(divida)} size="large">
                        <DeleteIcon fontSize="medium" />
                      </IconButton>
                    </Tooltip>
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
          onClose={(_event, reason) => {
            if (reason === 'clickaway') return;
            setError(null);
            setSuccessMessage(null);
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => {
              setError(null);
              setSuccessMessage(null);
            }}
            severity={error ? 'error' : 'success'}
            sx={{ width: '100%' }}
            variant="filled"
          >
            {error || successMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default DividaLista;