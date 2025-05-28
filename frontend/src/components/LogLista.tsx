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
  Snackbar,
  Alert,
} from '@mui/material';
import api from '../services/api';
import { Pagination } from './Pagination';
import { formatDate } from '../utils/formatters';

interface Log {
  id: number;
  usuario: string;
  acao: string;
  entidade: string;
  entidadeId: number;
  data: string;
  detalhes: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const LogLista: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = async () => {
    try {
      const response = await api.get<PaginatedResponse<Log>>('/logs', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setLogs(response.data.data);
      setTotalItems(response.data.total);
    } catch (err) {
      setError('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage]);

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
        <h2>Logs do Sistema</h2>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Ação</TableCell>
              <TableCell>Entidade</TableCell>
              <TableCell>ID da Entidade</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Detalhes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.usuario}</TableCell>
                <TableCell>{log.acao}</TableCell>
                <TableCell>{log.entidade}</TableCell>
                <TableCell>{log.entidadeId}</TableCell>
                <TableCell>{formatDate(log.data)}</TableCell>
                <TableCell>{log.detalhes}</TableCell>
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
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LogLista; 