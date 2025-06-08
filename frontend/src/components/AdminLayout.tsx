import React from 'react';
import { Drawer, List, ListItem, AppBar, Toolbar, Typography, Box, Divider, IconButton, ListItemButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import { SvgIconProps } from '@mui/material/SvgIcon';

const drawerWidth = 200;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
}

export default function AdminLayout({ children, menuItems }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  let logoSrc = '/img/logo-light.png';
  if (mode === 'dark') {
    logoSrc = '/img/logo-dark.png';
  }

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
        borderRight: 'none',
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
          boxShadow: '0 2px 12px 0 rgba(25, 118, 210, 0.10)',
          bgcolor: theme => theme.palette.background.paper,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          transition: 'background 0.3s',
        }}
      >
        <Box 
          component="img" 
          src={logoSrc} 
          alt="Logo" 
          sx={{ 
            width: 180, 
            height: 110,
            objectFit: 'contain', 
            display: 'block', 
            maxWidth: '95%', 
            mt: 1,
            cursor: 'pointer'
          }}
          onClick={() => handleNavigation('/dashboard')}
        />
      </Box>
      <Divider sx={{ display: 'none' }} />
      <List sx={{ pb: 3 }}>
        {menuItems.map((item) => {
          const selected = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ justifyContent: 'center' }}>
              <ListItemButton
                selected={selected}
                onClick={() => handleNavigation(item.path)}
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
                  cursor: 'pointer',
                }}
              >
                <Box sx={{ minWidth: 0, mr: 1.2, display: 'flex', alignItems: 'center' }}>
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(item.icon as React.ReactElement<SvgIconProps>, { 
                        fontSize: 'medium',
                        sx: { color: selected ? 'primary.main' : 'text.secondary' }
                      })
                    : null}
                </Box>
                <Typography 
                  sx={{ 
                    fontWeight: selected ? 700 : 500, 
                    fontSize: 16, 
                    color: selected ? 'primary.main' : 'text.primary', 
                    letterSpacing: 0.2 
                  }}
                >
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
            Painel Administrativo
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
          <IconButton 
            color="inherit" 
            onClick={handleLogout} 
            sx={{ mr: 1, cursor: 'pointer' }}
          >
            <LogoutIcon />
          </IconButton>
          <IconButton
            size="large"
            aria-label="account of current user"
            onClick={() => handleNavigation('/perfil')}
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
              cursor: 'pointer',
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
        <Box sx={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }}>
          {drawer}
        </Box>
      </Drawer>
      <Box 
        component="main" 
        sx={theme => ({ 
          flexGrow: 1, 
          bgcolor: theme.palette.background.default, 
          p: 3, 
          minHeight: '100vh', 
          transition: 'background 0.3s',
          overflow: 'auto'
        })}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}