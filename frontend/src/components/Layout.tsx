import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Group as GroupIcon,
  PersonOutline as PersonOutlineIcon,
  Logout as LogoutIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../logo.png';
import SuperAdminLayout from './SuperAdminLayout';

const drawerWidth = 200;

type LayoutProps = { children?: React.ReactNode };
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detecta superadmin
  // Corrigido: checa apenas user?.perfil === 'admin' && user?.email === 'super@pspc.com'
  const isSuperAdmin = user?.perfil === 'admin' && user?.email === 'super@pspc.com';
  if (isSuperAdmin) {
    return <SuperAdminLayout>{children}</SuperAdminLayout>;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    signOut();
    navigate('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <HomeIcon />,
      path: '/dashboard',
      adminOnly: false
    },
    {
      text: 'Clientes',
      icon: <GroupIcon />,
      path: '/clientes',
      adminOnly: false
    },
    {
      text: 'Usuários',
      icon: <PersonOutlineIcon />,
      path: '/usuarios',
      adminOnly: true
    },
    {
      text: 'Relatórios',
      icon: <BarChartIcon />,
      path: '/relatorios',
      adminOnly: true
    },
    {
      text: 'Consultar',
      icon: <SearchIcon />,
      path: '/consulta'
    },
    {
      text: 'Perfil',
      icon: <AccountCircleIcon />,
      path: '/perfil',
      adminOnly: false
    }
  ];

  const iconColors = [
    '#1976d2', // azul
    '#43a047', // verde
    '#fbc02d', // amarelo
    '#8e24aa', // roxo
    '#e64a19', // laranja
    '#0288d1'  // azul claro
  ];

  const drawer = (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(180deg, #1976d2 0%, #43a047 100%)',
      color: '#fff',
      boxShadow: '2px 0 12px 0 rgba(25, 118, 210, 0.08)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      borderRadius: 0
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', p: 0, pb: 0 }}>
        <img src={logo} alt="Logo" style={{ width: 160, height: 160, objectFit: 'contain', margin: '4px 0 0 -10px' }} />
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.15)', mt: 0, mb: 1 }} />
      <List sx={{ pb: 3 }}>
        {menuItems
          .filter(item => {
            if (item.adminOnly) return user?.perfil === 'admin';
            return true;
          })
          .map((item, idx) => {
            const selected = location.pathname.startsWith(item.path);
            // Ícones de Dashboard e Perfil em branco para maior contraste
            const isWhiteIcon = item.text === 'Dashboard' || item.text === 'Perfil';
            return (
              <ListItem key={item.text} disablePadding sx={{ justifyContent: 'center' }}>
                <ListItemButton
                  selected={selected}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
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
                    background: selected ? 'rgba(255,255,255,0.10)' : 'transparent',
                    borderLeft: selected ? `4px solid ${iconColors[idx % iconColors.length]}` : '4px solid transparent',
                    boxShadow: 'none',
                    transition: 'background 0.2s, border 0.2s',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, color: isWhiteIcon ? '#fff' : iconColors[idx % iconColors.length], fontSize: 32, mr: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))' }}>
                    {item.icon}
                  </ListItemIcon>
                  <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#fff', letterSpacing: 0.5 }}>
                    {item.text}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: 'linear-gradient(90deg, #1976d2 60%, #43a047 100%)',
          boxShadow: '0 2px 8px #0002'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
            {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'i-SPC'}
          </Typography>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{
                border: '2px solid #fff',
                boxShadow: '0 2px 8px #0002',
                background: 'linear-gradient(135deg, #43a047 0%, #1976d2 100%)',
                p: 0.5
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff', color: '#1976d2', fontWeight: 700, border: '2px solid #43a047' }}>
                {user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right'
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right'
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => {
                handleClose();
                navigate('/perfil');
              }}>
                Perfil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Sair
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'transparent'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 0, bgcolor: '#f5f6fa', minHeight: '100vh' }}
      >
        <Toolbar />
        {children ? children : <Outlet />}
      </Box>
    </Box>
  );
};

export default Layout;