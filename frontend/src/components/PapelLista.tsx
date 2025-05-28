import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Pagination } from './Pagination';

interface Papel {
  id: number;
  nome: string;
  descricao: string;
  permissoes: string[];
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const PapelLista: React.FC = () => {
  const navigate = useNavigate();
  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPapel, setSelectedPapel] = useState<Papel | null>(null);

  const fetchPapeis = async () => {
    try {
      const response = await api.get<PaginatedResponse<Papel>>('/papeis', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setPapeis(response.data.data);
      setTotalItems(response.data.total);
    } catch (err) {
      setError('Erro ao carregar papéis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapeis();
  }, [page, rowsPerPage]);

  const handleDeleteClick = (papel: Papel) => {
    setSelectedPapel(papel);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPapel) return;

    try {
      await api.delete(`/papeis/${selectedPapel.id}`);
      setSuccessMessage('Papel excluído com sucesso!');
      fetchPapeis();
    } catch (err) {
      setError('Erro ao excluir papel');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPapel(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPapel(null);
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
      <Box sx={{ mb: 2 }}>
        <h2>Papéis</h2>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Permissões</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {papeis.map((papel) => (
              <TableRow key={papel.id}>
                <TableCell>{papel.nome}</TableCell>
                <TableCell>{papel.descricao}</TableCell>
                <TableCell>{papel.permissoes.join(', ')}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/papeis/${papel.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(papel)}
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
            Tem certeza que deseja excluir este papel?
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

export default PapelLista; 