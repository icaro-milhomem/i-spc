import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Login from '../Login';
import api from '../../services/api';

jest.mock('../../services/api');
const mockApi = api as jest.Mocked<typeof api>;

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.post.mockResolvedValue({
      data: {
        token: 'fake-token',
        user: {
          id: 1,
          nome: 'Test User',
          email: 'test@example.com',
          perfil: 'admin'
        }
      }
    });
  });

  it('should render login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should show error message on invalid credentials', async () => {
    mockApi.post.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/email ou senha inválidos/i)).toBeInTheDocument();
    });
  });

  it('should navigate to dashboard on successful login', async () => {
    const mockUser = {
      id: 1,
      nome: 'Test User',
      email: 'test@example.com',
      perfil: 'admin'
    };

    mockApi.post.mockResolvedValue({
      data: {
        token: 'fake-token',
        user: mockUser
      }
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'correctpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        senha: 'correctpassword'
      });
    });
  });
}); 