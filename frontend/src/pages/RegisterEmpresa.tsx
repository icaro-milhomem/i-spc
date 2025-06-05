import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { validateCNPJ } from '../utils/cnpj-validation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert
} from '@mui/material';

export default function RegisterEmpresa() {
  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cnpjInvalido, setCnpjInvalido] = useState(false);
  const navigate = useNavigate();

  const buscarCep = async () => {
    if (cep.length < 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setUf(data.uf || '');
      }
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCnpjInvalido(false);
    if (!validateCNPJ(cnpj)) {
      setCnpjInvalido(true);
      setLoading(false);
      return;
    }
    try {
      await api.post('/tenants/register', {
        nome,
        cnpj,
        razao_social: razaoSocial,
        cep,
        endereco,
        numero,
        bairro,
        cidade,
        uf,
        email,
        senha
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Paper
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 4,
          boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)'
        }}
        elevation={4}
      >
        <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
          Cadastrar Empresa
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Empresa cadastrada com sucesso! Redirecionando...</Alert>}
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <TextField fullWidth label="Nome fantasia" value={nome} onChange={e => setNome(e.target.value)} margin="normal" required sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="Razão social" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} margin="normal" required sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="CNPJ" value={cnpj} onChange={e => setCnpj(e.target.value)} margin="normal" required error={cnpjInvalido} helperText={cnpjInvalido ? 'CNPJ inválido' : ''} inputProps={{ maxLength: 18 }} sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="CEP" value={cep} onChange={e => setCep(e.target.value)} onBlur={buscarCep} margin="normal" required inputProps={{ maxLength: 9 }} sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} margin="normal" required sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="Número" value={numero} onChange={e => setNumero(e.target.value)} margin="normal" required sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} margin="normal" required sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} margin="normal" required sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="UF" value={uf} onChange={e => setUf(e.target.value)} margin="normal" required inputProps={{ maxLength: 2 }} sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} margin="normal" required sx={{ borderRadius: 2 }} />
          <TextField fullWidth label="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} margin="normal" required sx={{ borderRadius: 2 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3, borderRadius: 2, fontWeight: 700, fontSize: 18 }} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}