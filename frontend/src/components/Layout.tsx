import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SuperAdminLayout from './SuperAdminLayout';
import AdminLayout from './AdminLayout';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Layout: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.perfil === 'superadmin';

  if (isSuperAdmin) {
    return <SuperAdminLayout><Outlet /></SuperAdminLayout>;
  }

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard', adminOnly: false },
    { text: 'Clientes', icon: <GroupIcon />, path: '/clientes', adminOnly: false },
    { text: 'Usuários', icon: <PersonOutlineIcon />, path: '/usuarios', adminOnly: true },
    { text: 'Relatórios', icon: <BarChartIcon />, path: '/relatorios', adminOnly: true },
    { text: 'Consultar', icon: <SearchIcon />, path: '/consulta', adminOnly: false },
    { text: 'Perfil', icon: <AccountCircleIcon />, path: '/perfil', adminOnly: false },
  ].filter(item => {
    if (item.adminOnly) return user?.perfil === 'admin';
    return true;
  });

  return (
    <AdminLayout menuItems={menuItems}>
      <Outlet />
    </AdminLayout>
  );
};

export default Layout;