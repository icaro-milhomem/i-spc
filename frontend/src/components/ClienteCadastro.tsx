import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, Alert } from '@mui/material';
import api from '../services/api';

const ClienteCadastro: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [status, setStatus] = useState('ativo');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      await api.post('/clientes', { cpf, nome, telefone, status });
      setSuccess('Cliente cadastrado com sucesso!');
      setCpf('');
      setNome('');
      setTelefone('');
      setStatus('ativo');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6fa' }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4, minWidth: 400, maxWidth: 500, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Cadastro de Cliente
        </Typography>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }} autoComplete="off">
          <TextField label="CPF *" value={cpf} onChange={e => setCpf(e.target.value.replace(/\D/g, ''))} required inputProps={{ maxLength: 11 }} sx={{ borderRadius: 2 }} />
          <TextField label="Nome *" value={nome} onChange={e => setNome(e.target.value)} required sx={{ borderRadius: 2 }} />
          <TextField label="Telefone" value={telefone} onChange={e => setTelefone(e.target.value.replace(/\D/g, ''))} sx={{ borderRadius: 2 }} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, borderRadius: 2, fontWeight: 700, fontSize: 18 }} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ClienteCadastro; 