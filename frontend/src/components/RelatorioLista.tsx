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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Pagination } from './Pagination';
import { formatDate } from '../utils/formatters';

interface Relatorio {
  id: number;
  titulo: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  status: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const RelatorioLista: React.FC = () => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRelatorio, setSelectedRelatorio] = useState<Relatorio | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  const fetchRelatorios = async () => {
    try {
      const response = await api.get<PaginatedResponse<Relatorio>>('/relatorios', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setRelatorios(response.data.data);
      setTotalItems(response.data.total);
    } catch (err) {
      setError('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorios();
  }, [page, rowsPerPage]);

  const handleDeleteClick = (relatorio: Relatorio) => {
    setSelectedRelatorio(relatorio);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRelatorio) return;

    try {
      await api.delete(`/relatorios/${selectedRelatorio.id}`);
      setSuccessMessage('Relatório excluído com sucesso!');
      fetchRelatorios();
    } catch (err) {
      setError('Erro ao excluir relatório');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRelatorio(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRelatorio(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <h2>Relatórios</h2>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/relatorios/novo')}
        >
          Novo Relatório
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Data Início</TableCell>
              <TableCell>Data Fim</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {relatorios.map((relatorio) => (
              <TableRow key={relatorio.id}>
                <TableCell>{relatorio.titulo}</TableCell>
                <TableCell>{relatorio.tipo}</TableCell>
                <TableCell>{formatDate(relatorio.dataInicio)}</TableCell>
                <TableCell>{formatDate(relatorio.dataFim)}</TableCell>
                <TableCell>{relatorio.status}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/relatorios/${relatorio.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(relatorio)}
                  >
                    <DeleteIcon />
                  </IconButton>
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
            Tem certeza que deseja excluir este relatório?
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

export default RelatorioLista; 