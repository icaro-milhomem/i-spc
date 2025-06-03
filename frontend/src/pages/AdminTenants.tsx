import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TenantCreateForm from './TenantCreateForm';
import {
  Paper,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Layout from '../components/Layout';

interface Tenant {
  id: number;
  nome: string;
  email: string;
  created_at: string;
}

export default function AdminTenants() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [tableLoading, setTableLoading] = useState(true);
  const [deleteTenant, setDeleteTenant] = useState<Tenant | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Log para depuração
  console.log('Usuário logado:', user);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const isSuperAdmin = (user as any).role === 'superadmin' || (user as any).perfil === 'superadmin';
    if (!isSuperAdmin) {
      navigate('/app');
      return;
    }
    fetchTenants();
    // eslint-disable-next-line
  }, [user, loading]);

  const fetchTenants = () => {
    setTableLoading(true);
    api.get('/tenants')
      .then(res => setTenants(res.data))
      .catch(() => setError('Erro ao carregar empresas'))
      .finally(() => setTableLoading(false));
  };

  const handleDelete = async () => {
    if (!deleteTenant) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/tenants/${deleteTenant.id}`);
      setDeleteTenant(null);
      fetchTenants();
    } catch (err) {
      alert('Erro ao excluir empresa');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <Box p={8} textAlign="center" color="primary.main" fontWeight="bold">Carregando...</Box>;
  }

  if (!user) return null;
  const isSuperAdmin = (user as any).role === 'superadmin' || (user as any).perfil === 'superadmin';
  if (!isSuperAdmin) {
    return <Box p={8} textAlign="center" color="error.main" fontWeight="bold">Acesso negado</Box>;
  }

  return (
    <Layout>
      <Paper elevation={2} sx={{ width: '100%', maxWidth: 900, p: 4, borderRadius: 4 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
          <Typography variant="h4" color="primary" fontWeight={700} letterSpacing={-1}>
            Empresas cadastradas
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowCreate(true)}
          >
            Nova Empresa
          </Button>
        </Box>
        {(showCreate || editTenant) && (
          <Box position="fixed" top={0} left={0} width="100vw" height="100vh" display="flex" alignItems="center" justifyContent="center" zIndex={1300} bgcolor="rgba(0,0,0,0.2)">
            <Box bgcolor="#fff" borderRadius={3} boxShadow={4} p={0} minWidth={350}>
              <TenantCreateForm
                onSuccess={() => { setShowCreate(false); setEditTenant(null); fetchTenants(); }}
                onCancel={() => { setShowCreate(false); setEditTenant(null); }}
                tenant={editTenant}
                isEdit={!!editTenant}
              />
            </Box>
          </Box>
        )}
        {tableLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={6}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" py={6}>{error}</Typography>
        ) : tenants.length === 0 ? (
          <Typography color="text.secondary" align="center" py={6}>Nenhuma empresa cadastrada ainda.</Typography>
        ) : (
          <Box overflow="auto">
            <Table sx={{ minWidth: 600, borderRadius: 2, background: '#fff' }}>
              <TableHead>
                <TableRow sx={{ background: '#e3f0fc' }}>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main', borderTopLeftRadius: 12 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>Criada em</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main', borderTopRightRadius: 12 }} align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tenants.map(t => (
                  <TableRow key={t.id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{t.id}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t.nome}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>{new Date(t.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="center">
                      <Button size="small" color="primary" startIcon={<EditIcon />} onClick={() => setEditTenant(t)}>
                        Editar
                      </Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteTenant(t)} sx={{ ml: 1 }}>
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        {/* Diálogo de confirmação de exclusão */}
        <Dialog open={!!deleteTenant} onClose={() => setDeleteTenant(null)}>
          <DialogTitle>Excluir empresa</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir a empresa <b>{deleteTenant?.nome}</b>? Esta ação não pode ser desfeita.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteTenant(null)} disabled={deleteLoading}>Cancelar</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={deleteLoading}>
              {deleteLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Layout>
  );
}