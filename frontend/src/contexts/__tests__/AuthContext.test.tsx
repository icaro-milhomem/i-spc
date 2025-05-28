import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import api from '../../services/api';

jest.mock('../../services/api');

const TestComponent = () => {
  const { user, signOut } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Logged in as: {user?.nome}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should provide auth context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should handle login', async () => {
    const mockUser = { id: 1, nome: 'Test User', email: 'test@example.com' };
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { token: 'fake-token', user: mockUser } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Logged in as: Test User')).toBeInTheDocument();
    });
  });

  it('should handle logout', async () => {
    const mockUser = { id: 1, nome: 'Test User', email: 'test@example.com' };
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { token: 'fake-token', user: mockUser } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Logged in as: Test User')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.queryByText('Logged in as: Test User')).not.toBeInTheDocument();
    });
  });

  it('should load user from token on mount', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'test-token';

    localStorage.setItem('token', mockToken);
    (api.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/logged in as: test user/i)).toBeInTheDocument();
    });
  });

  it('should handle failed token validation', async () => {
    const mockToken = 'invalid-token';

    localStorage.setItem('token', mockToken);
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Invalid token'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
}); 