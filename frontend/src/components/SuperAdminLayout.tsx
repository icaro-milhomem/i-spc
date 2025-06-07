import React from 'react';
import { Drawer, List, ListItem, AppBar, Toolbar, Typography, Box, Divider, IconButton, ListItemButton, GlobalStyles } from '@mui/material';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { SvgIconProps } from '@mui/material/SvgIcon';

const drawerWidth = 200;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
}

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  menuItems?: MenuItem[];
  user?: any;
}

export default function SuperAdminLayout({ children, menuItems: customMenuItems, user: customUser }: SuperAdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: contextUser } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const { signOut } = useAuth();

  let logoSrc = '/img/logo-light.png';
  if (mode === 'dark') {
    logoSrc = '/img/logo-dark.png';
  } else if (mode === 'black') {
    logoSrc = '/img/logo-black.png';
  }

  const menuItems = customMenuItems || [
    { text: 'Empresas', icon: <ApartmentOutlinedIcon />, path: '/admin/tenants' },
    { text: 'Gateway de Pagamento', icon: <CreditCardOutlinedIcon />, path: '/admin/gateway' },
    { text: 'Configurações', icon: <TuneOutlinedIcon />, path: '/admin/config' },
    { text: 'Editar Perfil', icon: <ManageAccountsOutlinedIcon />, path: '/admin/perfil' },
  ];
  const user = customUser || contextUser;

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const drawer = (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        background: theme => theme.palette.background.paper,
        color: theme => theme.palette.text.primary,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        borderRadius: 0,
        borderRight: 'none', // remove linha lateral
        transition: 'background 0.3s',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          p: 0,
          pb: 0,
          minHeight: 140,
          boxShadow: '0 2px 12px 0 rgba(25, 118, 210, 0.10)', // relevo sutil
          bgcolor: theme => theme.palette.background.paper,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          transition: 'background 0.3s',
        }}
      >
        <Box component="img" src={logoSrc} alt="Logo" sx={{ width: 180, height: 110, objectFit: 'contain', display: 'block', maxWidth: '95%', mt: 1 }} />
      </Box>
      <Divider sx={{ display: 'none' }} />
      <List sx={{ pb: 3 }}>
        {menuItems.map((item) => {
          const selected = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ justifyContent: 'center' }}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  if (!selected) navigate(item.path);
                }}
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  mx: 1,
                  mb: 0.5,
                  minHeight: 48,
                  backgroundColor: selected ? (mode === 'dark' ? 'rgba(25, 118, 210, 0.13)' : 'rgba(25, 118, 210, 0.08)') : 'transparent',
                  borderLeft: selected ? '4px solid' : '4px solid transparent',
                  borderColor: selected ? 'primary.main' : 'transparent',
                  transition: 'background 0.2s, border-color 0.2s',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? 'rgba(25, 118, 210, 0.18)' : 'rgba(25, 118, 210, 0.13)',
                  },
                  '& .menu-icon': {
                    transition: 'transform 0.35s cubic-bezier(.4,2,.6,1), color 0.2s',
                    transform: selected ? 'scale(1.18) rotate(-8deg)' : 'scale(1)',
                    color: selected ? 'primary.main' : 'text.secondary',
                    filter: selected ? 'drop-shadow(0 2px 6px rgba(25,118,210,0.18))' : 'none',
                    animation: selected ? 'icon-bounce 0.5s' : 'none',
                  },
                }}
              >
                <Box sx={{ minWidth: 0, mr: 1.2, display: 'flex', alignItems: 'center' }}>
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(item.icon as React.ReactElement<SvgIconProps>, { fontSize: 'medium' })
                    : null}
                </Box>
                <Typography sx={{ fontWeight: selected ? 700 : 500, fontSize: 16, color: selected ? 'primary.main' : 'text.primary', letterSpacing: 0.2 }}>
                  {item.text}
                </Typography>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: theme => theme.palette.background.paper,
          color: theme => theme.palette.text.primary,
          boxShadow: '0 2px 8px #0002',
          zIndex: theme => theme.zIndex.drawer + 1,
          transition: 'background 0.3s',
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            Painel Super Admin
          </Typography>
          <IconButton
            color="primary"
            onClick={toggleTheme}
            sx={{
              mr: 1,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: mode === 'dark' ? 'primary.light' : 'primary.main',
              background: mode === 'dark' ? 'background.paper' : 'background.default',
              transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.10)',
              '&:hover': {
                background: mode === 'dark' ? 'primary.dark' : 'primary.light',
                borderColor: 'primary.main',
                boxShadow: '0 4px 16px 0 rgba(25, 118, 210, 0.18)',
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} sx={{ mr: 1 }}>
            <LogoutIcon />
          </IconButton>
          <IconButton
            size="large"
            aria-label="account of current user"
            sx={{
              border: '2px solid',
              borderColor: 'primary.main',
              background: 'background.paper',
              p: 0.5,
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                userSelect: 'none',
              }}
            >
              {user?.nome ? user.nome.charAt(0).toUpperCase() : 'A'}
            </Box>
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
            background: 'background.paper',
            color: 'text.primary',
            borderRadius: 0,
            border: 'none',
            boxShadow: '2px 0 16px 0 rgba(25, 118, 210, 0.06)',
            overflowX: 'hidden',
            position: 'relative',
            transition: 'background 0.3s',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }}>
          {drawer}
        </Box>
      </Drawer>
      <Box component="main" sx={theme => ({ flexGrow: 1, bgcolor: theme.palette.background.default, p: 3, minHeight: '100vh', transition: 'background 0.3s' })}>
        <Toolbar />
        {children}
      </Box>
      <GlobalStyles styles={`
        @keyframes icon-bounce {
          0% { transform: scale(1) rotate(0deg); }
          30% { transform: scale(1.25) rotate(-8deg); }
          60% { transform: scale(0.95) rotate(-8deg); }
          100% { transform: scale(1.18) rotate(-8deg); }
        }
      `} />
    </Box>
  );
}