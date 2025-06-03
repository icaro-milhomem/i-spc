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
  Input,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';
import SuperAdminLayout from '../components/SuperAdminLayout';

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
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
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

      updateUser(response.data);
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

  useEffect(() => {
    console.log('User:', user);
  }, [user]);

  return (
    <>
      {user?.role === 'superadmin' || user?.perfil === 'superadmin' ? (
        <SuperAdminLayout>
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
              Meu Perfil
            </Typography>
            <Grid container spacing={3} alignItems="flex-start" justifyContent="flex-start">
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Dados Pessoais
                    </Typography>
                    <form onSubmit={handleUpdateProfile}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <Avatar src={avatar || undefined} sx={{ width: 80, height: 80, mb: 1, fontSize: 32 }}>
                          {formData.nome ? formData.nome.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <label htmlFor="avatar-upload">
                          <Input
                            id="avatar-upload"
                            type="file"
                            inputProps={{ accept: 'image/*' }}
                            sx={{ display: 'none' }}
                            onChange={handleAvatarChange}
                          />
                          <Button variant="outlined" component="span" size="small">
                            Trocar Avatar
                          </Button>
                        </label>
                      </Box>
                      <TextField
                        fullWidth
                        label="Nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        Atualizar Dados
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Alterar Senha
                    </Typography>
                    <form onSubmit={handleUpdatePassword}>
                      <TextField
                        fullWidth
                        label="Senha Atual"
                        name="senhaAtual"
                        type="password"
                        value={formData.senhaAtual}
                        onChange={handleChange}
                        margin="normal"
                        required
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
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        Alterar Senha
                      </Button>
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
        </SuperAdminLayout>
      ) : (
        <Layout>
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'left' }}>
              Meu Perfil
            </Typography>
            <Grid container spacing={3} alignItems="flex-start" justifyContent="flex-start">
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Dados Pessoais
                    </Typography>
                    <form onSubmit={handleUpdateProfile}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                        <Avatar src={avatar || undefined} sx={{ width: 80, height: 80, mb: 1, fontSize: 32 }}>
                          {formData.nome ? formData.nome.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                        <label htmlFor="avatar-upload">
                          <Input
                            id="avatar-upload"
                            type="file"
                            inputProps={{ accept: 'image/*' }}
                            sx={{ display: 'none' }}
                            onChange={handleAvatarChange}
                          />
                          <Button variant="outlined" component="span" size="small">
                            Trocar Avatar
                          </Button>
                        </label>
                      </Box>
                      <TextField
                        fullWidth
                        label="Nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                        required
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        Atualizar Dados
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Alterar Senha
                    </Typography>
                    <form onSubmit={handleUpdatePassword}>
                      <TextField
                        fullWidth
                        label="Senha Atual"
                        name="senhaAtual"
                        type="password"
                        value={formData.senhaAtual}
                        onChange={handleChange}
                        margin="normal"
                        required
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
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        sx={{ mt: 2 }}
                      >
                        Alterar Senha
                      </Button>
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
        </Layout>
      )}
    </>
  );
}; 