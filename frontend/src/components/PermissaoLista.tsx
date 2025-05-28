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

interface Permissao {
  id: number;
  nome: string;
  descricao: string;
  codigo: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const PermissaoLista: React.FC = () => {
  const navigate = useNavigate();
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPermissao, setSelectedPermissao] = useState<Permissao | null>(null);

  const fetchPermissoes = async () => {
    try {
      const response = await api.get<PaginatedResponse<Permissao>>('/permissoes', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setPermissoes(response.data.data);
      setTotalItems(response.data.total);
    } catch (err) {
      setError('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissoes();
  }, [page, rowsPerPage]);

  const handleDeleteClick = (permissao: Permissao) => {
    setSelectedPermissao(permissao);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPermissao) return;

    try {
      await api.delete(`/permissoes/${selectedPermissao.id}`);
      setSuccessMessage('Permissão excluída com sucesso!');
      fetchPermissoes();
    } catch (err) {
      setError('Erro ao excluir permissão');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPermissao(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPermissao(null);
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
        <h2>Permissões</h2>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Código</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissoes.map((permissao) => (
              <TableRow key={permissao.id}>
                <TableCell>{permissao.nome}</TableCell>
                <TableCell>{permissao.descricao}</TableCell>
                <TableCell>{permissao.codigo}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/permissoes/${permissao.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(permissao)}
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
            Tem certeza que deseja excluir esta permissão?
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

export default PermissaoLista; 