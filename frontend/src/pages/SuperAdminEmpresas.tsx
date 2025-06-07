import React, { useState, useEffect } from 'react';
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
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TenantCreateForm from './TenantCreateForm';
import { Pagination } from '../components/Pagination';

interface Empresa {
  id: number;
  nome: string;
  email: string;
  cnpj: string;
  razao_social: string;
  status: string;
  created_at: string;
}

const SuperAdminEmpresas: React.FC = () => {
  const { loading } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editEmpresa, setEditEmpresa] = useState<Empresa | null>(null);

  const fetchEmpresas = async () => {
    try {
      const response = await api.get('/tenants', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setEmpresas(response.data.tenants || response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar empresas');
    }
  };

  useEffect(() => {
    fetchEmpresas();
    // eslint-disable-next-line
  }, [page, rowsPerPage]);

  const handleDeleteClick = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmpresa) return;
    try {
      await api.delete(`/tenants/${selectedEmpresa.id}`);
      setSuccessMessage('Empresa excluída com sucesso!');
      fetchEmpresas();
    } catch (err) {
      setError('Erro ao excluir empresa');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedEmpresa(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedEmpresa(null);
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

  const filteredEmpresas = empresas.filter(empresa => {
    const term = searchTerm.toLowerCase();
    return (
      empresa.nome.toLowerCase().includes(term) ||
      empresa.email.toLowerCase().includes(term) ||
      empresa.cnpj?.toLowerCase().includes(term) ||
      empresa.razao_social?.toLowerCase().includes(term)
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
          Empresas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreate(true)}
        >
          Nova Empresa
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'flex-end' }}>
        <input
          type="text"
          placeholder="Buscar empresa..."
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
              <TableCell>CNPJ</TableCell>
              <TableCell>Razão Social</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Criada em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmpresas.map((empresa) => (
              <TableRow key={empresa.id}>
                <TableCell>{empresa.nome}</TableCell>
                <TableCell>{empresa.email}</TableCell>
                <TableCell>{empresa.cnpj}</TableCell>
                <TableCell>{empresa.razao_social}</TableCell>
                <TableCell>
                  <Chip
                    label={empresa.status ? empresa.status.charAt(0).toUpperCase() + empresa.status.slice(1) : 'Ativo'}
                    color={empresa.status === 'ativo' ? 'success' : empresa.status === 'inativo' ? 'default' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(empresa.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => setEditEmpresa(empresa)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(empresa)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Pagination
          totalItems={filteredEmpresas.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
      {/* Diálogo de criação/edição */}
      {(showCreate || editEmpresa) && (
        <Box position="fixed" top={0} left={0} width="100vw" height="100vh" display="flex" alignItems="center" justifyContent="center" zIndex={1300} bgcolor="rgba(0,0,0,0.2)">
          <Box bgcolor="#fff" borderRadius={3} boxShadow={4} p={0} minWidth={350}>
            <TenantCreateForm
              onSuccess={() => { setShowCreate(false); setEditEmpresa(null); fetchEmpresas(); }}
              onCancel={() => { setShowCreate(false); setEditEmpresa(null); }}
              tenant={editEmpresa}
              isEdit={!!editEmpresa}
            />
          </Box>
        </Box>
      )}
      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Excluir empresa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a empresa <b>{selectedEmpresa?.nome}</b>? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
      {/* Feedback visual */}
      <Snackbar
        open={!!error || !!successMessage}
        autoHideDuration={6000}
        onClose={() => { setError(null); setSuccessMessage(null); }}
      >
        <Alert
          onClose={() => { setError(null); setSuccessMessage(null); }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuperAdminEmpresas; 