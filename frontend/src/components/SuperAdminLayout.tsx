import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, Box, Divider, Avatar, IconButton } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 200;

const iconColors = [
  '#1976d2', // azul
  '#43a047', // verde
  '#fbc02d', // amarelo
  '#8e24aa', // roxo
];

const menuItems = [
  { text: 'Empresas', icon: <BusinessIcon />, path: '/admin/tenants' },
  { text: 'Gateway de Pagamento', icon: <PaymentIcon />, path: '/admin/gateway' },
  { text: 'Configurações', icon: <SettingsIcon />, path: '/admin/config' },
  { text: 'Editar Perfil', icon: <EditIcon />, path: '/perfil' },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)',
          boxShadow: '0 2px 8px #0002',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            Painel Super Admin
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            sx={{
              border: '2px solid #fff',
              boxShadow: '0 2px 8px #0002',
              background: 'linear-gradient(135deg, #43a047 0%, #1976d2 100%)',
              p: 0.5
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff', color: '#1976d2', fontWeight: 700, border: '2px solid #43a047' }}>
              {user?.nome ? user.nome.charAt(0).toUpperCase() : 'A'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #1976d2 0%, #43a047 100%)',
            color: '#fff',
            borderRadius: 0,
            border: 'none',
            boxShadow: '2px 0 12px 0 rgba(25, 118, 210, 0.08)',
            overflowX: 'hidden',
            position: 'relative'
          },
        }}
      >
        <Box sx={{ width: '100%', height: 6, bgcolor: '#1976d2', position: 'absolute', top: 0, left: 0, zIndex: 2 }} />
        <Toolbar />
        <Box sx={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }}>
          <List sx={{ pb: 3 }}>
            {menuItems.map((item, idx) => {
              const selected = location.pathname.startsWith(item.path);
              return (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  selected={selected}
                  sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    mx: 1,
                    mb: 0.5,
                    minHeight: 48,
                    background: selected ? 'rgba(255,255,255,0.10)' : 'transparent',
                    borderLeft: selected ? `4px solid ${iconColors[idx % iconColors.length]}` : '4px solid transparent',
                    boxShadow: 'none',
                    transition: 'background 0.2s, border 0.2s',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, color: iconColors[idx % iconColors.length], fontSize: 32, mr: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      sx: { fontWeight: 600, fontSize: 15, color: '#fff', letterSpacing: 0.5 }
                    }}
                  />
                </ListItem>
              );
            })}
            <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.15)' }} />
            <ListItem button onClick={handleLogout} sx={{ flexDirection: 'row', alignItems: 'center', mx: 1, borderRadius: 2, color: '#fff', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}>
              <ListItemIcon sx={{ minWidth: 0, color: '#e64a19', fontSize: 28, mr: 1 }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Sair" primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: 15, color: '#fff' } }} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f6fa', p: 3, minHeight: '100vh' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
} 