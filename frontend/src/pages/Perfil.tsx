import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || '';

export const Perfil: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [logoEmpresa, setLogoEmpresa] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          // Criar um canvas para redimensionar a imagem
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 200; // Tamanho máximo da imagem
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Converter para JPEG com qualidade 0.7
          const resizedImage = canvas.toDataURL('image/jpeg', 0.7);
          setAvatar(resizedImage);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoEmpresaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('A logo deve ser uma imagem.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 2MB');
        return;
      }
      setLogoFile(file);
      setLogoEmpresa(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put('/usuarios/me', {
        nome: formData.nome,
        email: formData.email,
        avatar: avatar || undefined
      });

      updateUser({ ...user, ...response.data });
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.novaSenha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await api.put('/usuarios/me/senha', {
        senhaAtual: formData.senhaAtual,
        novaSenha: formData.novaSenha,
      });

      setSuccess('Senha atualizada com sucesso!');
      setFormData(prev => ({
        ...prev,
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      }));
    } catch (err) {
      setError('Erro ao atualizar senha. Verifique se a senha atual está correta.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadLogoEmpresa = async () => {
    if (!logoFile) return;
    setLogoLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Sessão expirada. Por favor, faça login novamente.');
        return;
      }

      const response = await api.post('/tenants/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.logo) {
        setSuccess('Logo da empresa atualizada com sucesso!');
        setLogoEmpresa(response.data.logo);
        setLogoFile(null);
      } else if (response.data && response.data.message) {
        setError(response.data.message);
        setLogoFile(null);
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (err: any) {
      console.error('Erro ao enviar logo:', err);
      setError(err.response?.data?.error || 'Erro ao enviar logo da empresa. Tente novamente.');
    } finally {
      setLogoLoading(false);
    }
  };

  // Buscar logo da empresa ao carregar o perfil
  const fetchLogo = async (apagarLogoFile = false) => {
    try {
      const res = await api.get('/tenants/minha');
      setLogoEmpresa(res.data.logo || null);
      if (apagarLogoFile) setLogoFile(null);
    } catch {
      setLogoEmpresa(null);
      if (apagarLogoFile) setLogoFile(null);
    }
  };

  useEffect(() => {
    fetchLogo();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nome: user.nome || '',
        email: user.email || '',
      }));
      setAvatar(user.avatar || null);
    }
  }, [user]);

  // Exibe a logo corretamente, seja preview local ou logo do backend
  const getLogoPreview = () => {
    if (logoFile) {
      // Preview local do arquivo selecionado
      return logoEmpresa;
    }
    if (logoEmpresa) {
      // Se já for uma URL absoluta (começa com http), retorna direto
      if (logoEmpresa.startsWith('http')) return logoEmpresa;
      // Se for caminho relativo, monta a URL absoluta
      return `${API_URL.replace(/\/$/, '')}/${logoEmpresa.replace(/^\//, '')}`;
    }
    return null;
  };

  const renderContent = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
        Meu Perfil
      </Typography>
      <Grid container spacing={3} alignItems="stretch" justifyContent="flex-start">
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dados Pessoais
              </Typography>
              <form onSubmit={handleUpdateProfile}>
                {user?.role === 'admin' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, mb: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar src={avatar || undefined} sx={{ width: 80, height: 80, mb: 1, fontSize: '2rem' }} />
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="avatar-upload"
                        type="file"
                        onChange={handleAvatarChange}
                      />
                      <label htmlFor="avatar-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          Alterar Avatar
                        </Button>
                      </label>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {(logoEmpresa || logoFile) ? (
                        <Avatar
                          src={getLogoPreview() || undefined}
                          sx={{ width: 80, height: 80, mb: 1, fontSize: '2rem', borderRadius: '50%' }}
                          alt="Logo da empresa"
                        />
                      ) : (
                        <Avatar
                          sx={{ width: 80, height: 80, mb: 1, fontSize: 12, bgcolor: 'background.paper', color: 'text.secondary', border: '2px dashed', borderColor: 'divider' }}
                        >
                          Sem logo
                        </Avatar>
                      )}
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="logo-upload"
                        type="file"
                        onChange={handleLogoEmpresaChange}
                      />
                      <label htmlFor="logo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          {(logoEmpresa || logoFile) ? 'Alterar Logo' : 'Selecionar Logo'}
                        </Button>
                      </label>
                      {logoFile && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{ mt: 1, minWidth: 120 }}
                          onClick={handleUploadLogoEmpresa}
                          disabled={logoLoading}
                        >
                          {logoLoading ? <CircularProgress size={18} /> : 'Salvar Logo'}
                        </Button>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Avatar src={avatar || undefined} sx={{ width: 80, height: 80, mb: 1, fontSize: '2rem' }} />
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarChange}
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Alterar Avatar
                      </Button>
                    </label>
                  </Box>
                )}
                <TextField
                  fullWidth
                  label="Nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  margin="normal"
                  required
                  type="email"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Atualizar Perfil'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alterar Senha
              </Typography>
              <form onSubmit={handleUpdatePassword}>
                <Box sx={{ mt: 8 }}>
                  <TextField
                    fullWidth
                    label="Senha Atual"
                    name="senhaAtual"
                    type="password"
                    value={formData.senhaAtual}
                    onChange={handleChange}
                    margin="normal"
                    required
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Nova Senha"
                    name="novaSenha"
                    type="password"
                    value={formData.novaSenha}
                    onChange={handleChange}
                    margin="normal"
                    required
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Confirmar Nova Senha"
                    name="confirmarSenha"
                    type="password"
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                    margin="normal"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Alterar Senha'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );

  return renderContent();
};