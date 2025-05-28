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
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { Pagination } from './Pagination';

interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  descricao: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const ConfiguracaoLista: React.FC = () => {
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConfiguracao, setSelectedConfiguracao] = useState<Configuracao | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchConfiguracoes = async () => {
    try {
      const response = await api.get<PaginatedResponse<Configuracao>>('/configuracoes', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setConfiguracoes(response.data.data);
      setTotalItems(response.data.total);
    } catch (err) {
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, [page, rowsPerPage]);

  const handleEditClick = (configuracao: Configuracao) => {
    setSelectedConfiguracao(configuracao);
    setEditValue(configuracao.valor);
    setEditDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!selectedConfiguracao) return;

    try {
      await api.put(`/configuracoes/${selectedConfiguracao.id}`, {
        valor: editValue,
      });
      setSuccessMessage('Configuração atualizada com sucesso!');
      fetchConfiguracoes();
    } catch (err) {
      setError('Erro ao atualizar configuração');
    } finally {
      setEditDialogOpen(false);
      setSelectedConfiguracao(null);
      setEditValue('');
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setSelectedConfiguracao(null);
    setEditValue('');
  };

  const handleDeleteClick = (configuracao: Configuracao) => {
    setSelectedConfiguracao(configuracao);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedConfiguracao) return;

    try {
      await api.delete(`/configuracoes/${selectedConfiguracao.id}`);
      setSuccessMessage('Configuração excluída com sucesso!');
      fetchConfiguracoes();
    } catch (err) {
      setError('Erro ao excluir configuração');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedConfiguracao(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedConfiguracao(null);
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
        <h2>Configurações do Sistema</h2>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Chave</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configuracoes.map((configuracao) => (
              <TableRow key={configuracao.id}>
                <TableCell>{configuracao.chave}</TableCell>
                <TableCell>{configuracao.valor}</TableCell>
                <TableCell>{configuracao.descricao}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(configuracao)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(configuracao)}
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
        open={editDialogOpen}
        onClose={handleEditCancel}
      >
        <DialogTitle>Editar Configuração</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Valor"
            type="text"
            fullWidth
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditCancel}>Cancelar</Button>
          <Button onClick={handleEditConfirm} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir esta configuração?
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

export default ConfiguracaoLista; 