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

interface Tenant {
  id: number;
  nome: string;
  email: string;
  created_at: string;
}

export default function AdminTenants() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    if (!user) return;
    if ((user as any).role && (user as any).role !== 'superadmin') {
      navigate('/app');
      return;
    }
    fetchTenants();
    // eslint-disable-next-line
  }, [user]);

  const fetchTenants = () => {
    setLoading(true);
    api.get('/tenants')
      .then(res => setTenants(res.data))
      .catch(() => setError('Erro ao carregar empresas'))
      .finally(() => setLoading(false));
  };

  if (!user) return null;
  if ((user as any).role && (user as any).role !== 'superadmin') {
    return <Box p={8} textAlign="center" color="error.main" fontWeight="bold">Acesso negado</Box>;
  }

  return (
    <Box minHeight="100vh" bgcolor="#f5f6fa" display="flex" flexDirection="column" alignItems="center" py={6}>
      <Paper elevation={2} sx={{ width: '100%', maxWidth: 900, p: 4, borderRadius: 4 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} gap={2}>
          <Typography variant="h4" color="primary" fontWeight={700} letterSpacing={-1}>
            Empresas cadastradas
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setShowCreate(true)}
            sx={{ borderRadius: 2, fontWeight: 600, boxShadow: 1 }}
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
        {loading ? (
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
} 