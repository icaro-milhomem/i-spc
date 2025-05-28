import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import Dashboard from '../Dashboard';
import api from '../../services/api';

jest.mock('../../services/api');
const mockApi = api as jest.Mocked<typeof api>;

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockApi.get.mockClear();
  });

  it('should render dashboard with statistics', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        totalClientes: 100,
        inadimplentes: 20,
        consultasHoje: 50,
      },
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  it('should show error message with invalid CPF', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    const cpfInput = screen.getByLabelText(/cpf/i);
    const searchButton = screen.getByRole('button', { name: /consultar/i });

    fireEvent.change(cpfInput, { target: { value: '123' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
    });
  });

  it('should show client information on successful search', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: {
        cliente: {
          id: 1,
          cpf: '12345678900',
          nome: 'João Silva',
          telefone: '11999999999',
          status: 'Inadimplente',
        },
        dividas: [
          {
            id: 1,
            descricao: 'Mensalidade',
            valor: 100,
            data: '2024-02-01',
            status: 'Pendente',
          },
        ],
        data_consulta: '2024-02-20',
      },
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    const cpfInput = screen.getByLabelText(/cpf/i);
    const searchButton = screen.getByRole('button', { name: /consultar/i });

    fireEvent.change(cpfInput, { target: { value: '12345678900' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText('12345678900')).toBeInTheDocument();
      expect(screen.getByText('Inadimplente')).toBeInTheDocument();
      expect(screen.getByText('Mensalidade')).toBeInTheDocument();
      expect(screen.getByText('R$ 100,00')).toBeInTheDocument();
    });
  });

  it('should navigate to login on logout', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );

    const logoutButton = screen.getByRole('button', { name: /sair/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
}); 