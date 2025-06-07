import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(formData.email, formData.senha);
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setUser(response.data);
        if (response.data.perfil === 'superadmin') {
          navigate('/admin/tenants');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      setError('Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 50%)',
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
          transition: 'transform 0.1s ease-out',
          pointerEvents: 'none',
        }
      }}
    >
      {/* Efeito de partículas */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.2)', opacity: 0.8 },
            '100%': { transform: 'scale(1)', opacity: 0.5 },
          }
        }}
      />

      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, sm: 5 },
          width: '100%',
          maxWidth: 400,
          borderRadius: 5,
          backdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255,255,255,0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: 'translateY(0)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
          }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 2,
            '& img': {
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                filter: 'drop-shadow(0 0 12px #1976d2)',
              }
            }
          }}
        >
          <img 
            src="/img/logo.login.png" 
            alt="Logo" 
            style={{ 
              width: '100%', 
              maxWidth: 160, 
              marginBottom: 8,
              filter: 'drop-shadow(0 0 8px #1976d2)'
            }} 
          />
        </Box>

        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            color: '#fff', 
            letterSpacing: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            mb: 4
          }}
        >
          Login
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            autoFocus
            InputProps={{
              sx: {
                borderRadius: 3,
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                '& input': { 
                  color: '#fff',
                  '&::placeholder': { color: 'rgba(255,255,255,0.7)' }
                },
                '&:hover': { 
                  background: 'rgba(255,255,255,0.12)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease'
                },
                '&.Mui-focused': {
                  background: 'rgba(255,255,255,0.15)',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)'
                }
              }
            }}
            InputLabelProps={{ 
              sx: { 
                color: '#b0b8c1'
              } 
            }}
          />

          <TextField
            fullWidth
            label="Senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              sx: {
                borderRadius: 3,
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                '& input': { 
                  color: '#fff',
                  '&::placeholder': { color: 'rgba(255,255,255,0.7)' }
                },
                '&:hover': { 
                  background: 'rgba(255,255,255,0.12)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease'
                },
                '&.Mui-focused': {
                  background: 'rgba(255,255,255,0.15)',
                  boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.5)'
                }
              }
            }}
            InputLabelProps={{ 
              sx: { 
                color: '#b0b8c1'
              } 
            }}
          />

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 2,
                background: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid rgba(211, 47, 47, 0.3)',
                color: '#ff8a80'
              }}
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 700,
              fontSize: '1.1rem',
              borderRadius: 3,
              boxShadow: '0 4px 14px 0 rgba(25, 118, 210, 0.4)',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px 0 rgba(25, 118, 210, 0.5)',
              },
              '&:active': {
                transform: 'translateY(1px)',
              }
            }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            fullWidth
            sx={{
              mt: 2,
              py: 1.3,
              borderRadius: 3,
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.3)',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255,255,255,0.1)',
                borderColor: '#fff',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px 0 rgba(255,255,255,0.1)',
              },
              '&:active': {
                transform: 'translateY(1px)',
              }
            }}
            onClick={() => navigate('/register-empresa')}
            disabled={loading}
          >
            Cadastrar Empresa
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;