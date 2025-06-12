import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  nome: string;
  email: string;
  perfil: 'admin' | 'user' | 'superadmin';
  avatar?: string | null;
  role?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signOut: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para carregar o usuário
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('🔑 Nenhum token encontrado');
        setUser(null);
        return;
      }

      console.log('🔑 Token encontrado, carregando usuário...');
      const response = await api.get('/auth/me');
      console.log('👤 Usuário carregado:', response.data);
      setUser(response.data);
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para verificar o token e carregar o usuário ao iniciar
  useEffect(() => {
    console.log('🔄 Iniciando verificação de autenticação...');
    loadUser();
  }, []);

  const signIn = async (email: string, senha: string) => {
    try {
      console.log('🔑 Tentando fazer login...');
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data;
      
      if (!token || !usuario) {
        throw new Error('Resposta inválida do servidor');
      }

      console.log('✅ Login bem sucedido');
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(usuario);
    } catch (error) {
      console.error('❌ Erro no login:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      throw error;
    }
  };

  const signOut = () => {
    console.log('👋 Fazendo logout...');
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    console.log('📝 Atualizando dados do usuário:', updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 