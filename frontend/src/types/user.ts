export type UserProfile = 'admin' | 'user';

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: UserProfile;
  createdAt: string;
  updatedAt: string;
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