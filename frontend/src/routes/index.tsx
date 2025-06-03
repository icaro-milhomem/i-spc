import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ModalProvider } from '../contexts/ModalContext';
import Layout from '../components/Layout';
import Login from '../components/Login';
import Dashboard from '../pages/Dashboard';
import { UsuarioLista } from '../components/UsuarioLista';
import UsuarioEdicao from '../components/UsuarioEdicao';
import ClienteLista from '../components/ClienteLista';
import ClienteForm from '../components/ClienteForm';
import DividaLista from '../components/DividaLista';
import DividaForm from '../components/DividaForm';
import { Relatorios } from '../pages/Relatorios';
import { Perfil } from '../pages/Perfil';
import { RecuperarSenha } from '../components/RecuperarSenha';
import { RedefinirSenha } from '../components/RedefinirSenha';
import { ConsultaCPF } from '../pages/ConsultaCPF';
import AdminTenants from '../pages/AdminTenants';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.perfil !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ModalProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />

          {/* Rota exclusiva do superadmin */}
          {(user as any)?.role === 'superadmin' && (
            <Route path="/admin/tenants" element={<AdminTenants />} />
          )}

          {/* Rotas normais, só para quem NÃO é superadmin */}
          {(user as any)?.role !== 'superadmin' && (
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="perfil" element={<Perfil />} />
              <Route
                path="usuarios"
                element={
                  <PrivateRoute requireAdmin>
                    <UsuarioLista />
                  </PrivateRoute>
                }
              />
              <Route
                path="usuarios/novo"
                element={
                  <PrivateRoute requireAdmin>
                    <UsuarioEdicao />
                  </PrivateRoute>
                }
              />
              <Route
                path="usuarios/:id"
                element={
                  <PrivateRoute requireAdmin>
                    <UsuarioEdicao />
                  </PrivateRoute>
                }
              />
              <Route
                path="clientes"
                element={
                  <PrivateRoute>
                    <ClienteLista />
                  </PrivateRoute>
                }
              />
              <Route
                path="clientes/novo"
                element={
                  <PrivateRoute>
                    <ClienteForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="clientes/:id"
                element={
                  <PrivateRoute>
                    <ClienteForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="clientes/:id/dividas"
                element={
                  <PrivateRoute>
                    <DividaLista />
                  </PrivateRoute>
                }
              />
              <Route
                path="clientes/:id/dividas/nova"
                element={
                  <PrivateRoute>
                    <DividaForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="clientes/:id/dividas/:idDivida"
                element={
                  <PrivateRoute>
                    <DividaForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="relatorios"
                element={
                  <PrivateRoute>
                    <Relatorios />
                  </PrivateRoute>
                }
              />
              <Route
                path="consulta"
                element={
                  <PrivateRoute>
                    <ConsultaCPF />
                  </PrivateRoute>
                }
              />
            </Route>
          )}

          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to={(user as any)?.role === 'superadmin' ? '/admin/tenants' : '/dashboard'} />} />
        </Routes>
      </ModalProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;