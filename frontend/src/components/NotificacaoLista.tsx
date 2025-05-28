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
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Check as CheckIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { Pagination } from './Pagination';
import { formatDate } from '../utils/formatters';

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  data: string;
  lida: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const NotificacaoLista: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchNotificacoes = async () => {
    try {
      const response = await api.get<PaginatedResponse<Notificacao>>('/notificacoes', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setNotificacoes(response.data.data);
      setTotalItems(response.data.total);
    } catch (err) {
      setError('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
  }, [page, rowsPerPage]);

  const handleMarcarComoLida = async (id: number) => {
    try {
      await api.put(`/notificacoes/${id}/lida`);
      setSuccessMessage('Notificação marcada como lida!');
      fetchNotificacoes();
    } catch (err) {
      setError('Erro ao marcar notificação como lida');
    }
  };

  const handleExcluir = async (id: number) => {
    try {
      await api.delete(`/notificacoes/${id}`);
      setSuccessMessage('Notificação excluída com sucesso!');
      fetchNotificacoes();
    } catch (err) {
      setError('Erro ao excluir notificação');
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
    return <div>Carregando...</div>;
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <h2>Notificações</h2>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Mensagem</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notificacoes.map((notificacao) => (
              <TableRow key={notificacao.id}>
                <TableCell>{notificacao.titulo}</TableCell>
                <TableCell>{notificacao.mensagem}</TableCell>
                <TableCell>{notificacao.tipo}</TableCell>
                <TableCell>{formatDate(notificacao.data)}</TableCell>
                <TableCell>{notificacao.lida ? 'Lida' : 'Não lida'}</TableCell>
                <TableCell align="right">
                  {!notificacao.lida && (
                    <IconButton
                      color="primary"
                      onClick={() => handleMarcarComoLida(notificacao.id)}
                    >
                      <CheckIcon />
                    </IconButton>
                  )}
                  <IconButton
                    color="error"
                    onClick={() => handleExcluir(notificacao.id)}
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

export default NotificacaoLista; 