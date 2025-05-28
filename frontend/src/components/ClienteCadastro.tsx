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
    <Paper sx={{ p: 4, maxWidth: 400, margin: '0 auto' }}>
      <Typography variant="h6" gutterBottom>
        Cadastro de Cliente
      </Typography>
      {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="CPF" value={cpf} onChange={e => setCpf(e.target.value.replace(/\D/g, ''))} required inputProps={{ maxLength: 11 }} />
        <TextField label="Nome" value={nome} onChange={e => setNome(e.target.value)} required />
        <TextField label="Telefone" value={telefone} onChange={e => setTelefone(e.target.value.replace(/\D/g, ''))} />
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ClienteCadastro; 