export type UserProfile = 'admin' | 'user';

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: UserProfile;
  role?: string; // superadmin, admin, user
  createdAt: string;
  updatedAt: string;
  avatar?: string | null;
  tenant_id?: number | null;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
  perfil: UserProfile;
} 