import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configura o token inicial se existir
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Token inicial configurado');
}

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Adiciona o token de autenticação
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log da requisição
    console.log('🚀 Requisição:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      params: config.params
    });

    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // Log da resposta
    console.log('✅ Resposta:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log do erro
    console.error('❌ Erro na resposta:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Trata erros de autenticação
    if (error.response?.status === 401) {
      console.log('🔒 Sessão expirada, redirecionando para login');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 