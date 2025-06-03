import { useState, useEffect } from 'react';
import api from '../services/api';
import { validateCNPJ } from '../utils/cnpj-validation';
import { Box, Typography, TextField, Button, Grid, Paper } from '@mui/material';
import Layout from '../components/Layout';

interface Tenant {
  id: number;
  nome: string;
  cnpj?: string;
  razao_social?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  email?: string;
}

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  tenant?: Tenant | null;
  isEdit?: boolean;
}

export default function TenantCreateForm({ onSuccess, onCancel, tenant, isEdit }: Props) {
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [emailAdmin, setEmailAdmin] = useState('');
  const [senhaAdmin, setSenhaAdmin] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cnpjInvalido, setCnpjInvalido] = useState(false);

  useEffect(() => {
    if (tenant && isEdit) {
      setNomeEmpresa(tenant.nome || '');
      setRazaoSocial(tenant.razao_social || '');
      setCnpj(tenant.cnpj || '');
      setCep(tenant.cep || '');
      setEndereco(tenant.endereco || '');
      setNumero(tenant.numero || '');
      setBairro(tenant.bairro || '');
      setCidade(tenant.cidade || '');
      setUf(tenant.uf || '');
      setEmailAdmin(tenant.email || '');
      setSenhaAdmin('');
    } else {
      setNomeEmpresa('');
      setRazaoSocial('');
      setCnpj('');
      setCep('');
      setEndereco('');
      setNumero('');
      setBairro('');
      setCidade('');
      setUf('');
      setEmailAdmin('');
      setSenhaAdmin('');
    }
  }, [tenant, isEdit]);

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
      if (isEdit && tenant) {
        await api.put(`/tenants/${tenant.id}`, {
          nome: nomeEmpresa,
          cnpj,
          razao_social: razaoSocial,
          cep,
          endereco,
          numero,
          bairro,
          cidade,
          uf,
          email: emailAdmin
        });
      } else {
        await api.post('/tenants', {
          nome: nomeEmpresa,
          cnpj,
          razao_social: razaoSocial,
          cep,
          endereco,
          numero,
          bairro,
          cidade,
          uf,
          admin: {
            email: emailAdmin,
            senha: senhaAdmin
          }
        });
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Paper elevation={4} sx={{ borderRadius: 4, p: 4, minWidth: 350, maxWidth: 500 }}>
        <Typography variant="h5" color="primary" fontWeight={700} align="center" mb={2}>
          {isEdit ? 'Editar Empresa' : 'Nova Empresa'}
        </Typography>
        {error && <Typography color="error" mb={2} align="center">{error}</Typography>}
        {success && <Typography color="success.main" mb={2} align="center">Empresa salva com sucesso!</Typography>}
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label="Nome fantasia" value={nomeEmpresa} onChange={e => setNomeEmpresa(e.target.value)} fullWidth required size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Razão social" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} fullWidth required size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="CNPJ" value={cnpj} onChange={e => setCnpj(e.target.value)} fullWidth required size="small" error={cnpjInvalido} helperText={cnpjInvalido ? 'CNPJ inválido' : ''} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="CEP" value={cep} onChange={e => setCep(e.target.value)} onBlur={buscarCep} fullWidth required size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} fullWidth required size="small" />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField label="Número" value={numero} onChange={e => setNumero(e.target.value)} fullWidth required size="small" />
            </Grid>
            <Grid item xs={6} sm={8}>
              <TextField label="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} fullWidth required size="small" />
            </Grid>
            <Grid item xs={8} sm={8}>
              <TextField label="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} fullWidth required size="small" />
            </Grid>
            <Grid item xs={4} sm={4}>
              <TextField label="UF" value={uf} onChange={e => setUf(e.target.value)} fullWidth required size="small" inputProps={{ maxLength: 2 }} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="E-mail do admin" type="email" value={emailAdmin} onChange={e => setEmailAdmin(e.target.value)} fullWidth required size="small" disabled={isEdit} />
            </Grid>
            {!isEdit && (
              <Grid item xs={12}>
                <TextField label="Senha do admin" type="password" value={senhaAdmin} onChange={e => setSenhaAdmin(e.target.value)} fullWidth required size="small" />
              </Grid>
            )}
            <Grid item xs={12} display="flex" gap={2} justifyContent="center" mt={1}>
              <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ minWidth: 120, fontWeight: 600 }}>
                {loading ? (isEdit ? 'Salvando...' : 'Cadastrando...') : (isEdit ? 'Salvar' : 'Cadastrar')}
              </Button>
              <Button type="button" variant="outlined" color="primary" onClick={onCancel} disabled={loading} sx={{ minWidth: 120, fontWeight: 600 }}>
                Cancelar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Layout>
  );
} 