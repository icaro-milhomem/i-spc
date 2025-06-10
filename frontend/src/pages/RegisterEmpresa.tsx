import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { validateCNPJ } from '../utils/cnpj-validation';
import Input from '@mui/material/Input';
import Avatar from '@mui/material/Avatar';
import { getLogoUrl } from '../utils/logoUrl';

export default function RegisterEmpresa() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cnpjInvalido, setCnpjInvalido] = useState(false);
  const [cnpjJaCadastrado, setCnpjJaCadastrado] = useState<string | null>(null);
  const [ultimoCnpjConsultado, setUltimoCnpjConsultado] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
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
      // Cadastro da empresa
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
      // Upload da logo, se houver
      if (logo) {
        const formData = new FormData();
        formData.append('logo', logo);
        // Envia o token de autenticação se necessário
        const token = localStorage.getItem('token');
        await api.post('/tenants/logo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Redirecionar para a página de login
        navigate('/login');
      }, 1200);
    } catch (err: any) {
      // Verifica se o erro é de CNPJ já cadastrado
      const msg = err.response?.data?.error || '';
      if (msg.toLowerCase().includes('cnpj') && msg.toLowerCase().includes('existe')) {
        // Tenta extrair o nome da empresa do erro, se vier do backend
        const empresaMatch = msg.match(/empresa\s*['"]?([^'"\n]+)['"]?/i);
        const empresaNome = empresaMatch ? empresaMatch[1] : '';
        setError(empresaNome
          ? `CNPJ já cadastrado para a empresa: ${empresaNome}`
          : 'CNPJ já cadastrado para outra empresa.');
      } else {
        setError(msg || 'Erro ao cadastrar empresa');
      }
    } finally {
      setLoading(false);
    }
  };

  // Busca CEP automático
  const buscarCep = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
        setUf(data.uf || '');
      }
    } catch {}
  };

  // Função para buscar dados do CNPJ na ReceitaWS/Speedio (via backend)
  const buscarCnpjSpeedio = async (cnpjBusca: string) => {
    try {
      const res = await api.get(`/speedio/cnpj/${cnpjBusca}`);
      const data = res.data;
      // ReceitaWS
      if (data && data.nome) {
        setRazaoSocial(data.nome || '');
        setNome(data.fantasia || '');
        setEndereco(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.municipio || '');
        setUf(data.uf || '');
        setCep(data.cep || '');
      // Speedio
      } else if (data && data.RAZAO_SOCIAL) {
        setRazaoSocial(data.RAZAO_SOCIAL || '');
        setNome(data.NOME_FANTASIA || '');
        setEndereco(data.LOGRADOURO || '');
        setBairro(data.BAIRRO || '');
        setCidade(data.MUNICIPIO || '');
        setUf(data.UF || '');
        setCep(data.CEP || '');
      } else {
        setError('CNPJ não encontrado na base pública.');
      }
    } catch (e: any) {
      setError('Erro ao consultar dados do CNPJ. Tente novamente mais tarde.');
    }
  };

  // Função auxiliar para saber se deve mostrar erro de CNPJ
  const deveMostrarErroCnpj = cnpj.replace(/\D/g, '').length >= 14 && cnpjInvalido;

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{ bgcolor: theme.palette.background.default }}>
      <Paper
        sx={{
          p: 3,
          width: '100%',
          maxWidth: 720,
          borderRadius: 4,
          boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)',
          bgcolor: theme.palette.background.paper
        }}
        elevation={4}
      >
        <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
          Cadastrar Empresa
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Empresa cadastrada com sucesso!</Alert>}
        <Box component="form" onSubmit={handleSubmit} autoComplete="off" mt={2}>
          <Grid container spacing={2}>
            {/* Campo de upload de logo */}
            <Grid item xs={12} display="flex" flexDirection="column" alignItems="center" mb={1}>
              <Avatar src={getLogoUrl(logoPreview)} sx={{ width: 80, height: 80, mb: 1, fontSize: 32 }}>
                {nome ? nome.charAt(0).toUpperCase() : 'E'}
              </Avatar>
              <label htmlFor="logo-upload">
                <Input
                  id="logo-upload"
                  type="file"
                  inputProps={{ accept: 'image/*' }}
                  sx={{ display: 'none' }}
                  onChange={handleLogoChange}
                />
                <Button variant="outlined" component="span" size="small">
                  {logo ? 'Trocar Logo' : 'Adicionar Logo'}
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary" mt={1}>
                (Opcional) Adicione a logo da empresa. Você poderá adicionar ou trocar depois.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Nome fantasia" value={nome} onChange={e => setNome(e.target.value)} required size="medium" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Razão social" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} required size="medium" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="CNPJ"
                value={cnpj}
                onChange={e => {
                  // Limpa e limita a 14 dígitos, sem máscara
                  let valor = e.target.value.replace(/\D/g, '').slice(0, 14);
                  setCnpj(valor);
                  setCnpjJaCadastrado(null);
                  if (valor.length === 14) {
                    setCnpjInvalido(!validateCNPJ(valor));
                  } else {
                    setCnpjInvalido(false);
                  }
                }}
                onBlur={async () => {
                  if (cnpj.length < 14) {
                    setCnpjInvalido(false);
                    return;
                  }
                  if (!validateCNPJ(cnpj)) {
                    setCnpjInvalido(true);
                    return;
                  }
                  setCnpjInvalido(false);
                  if (cnpj === ultimoCnpjConsultado) return;
                  setUltimoCnpjConsultado(cnpj);
                  // Verifica se já existe no banco interno
                  try {
                    const res = await api.get(`/tenants/cnpj/${cnpj}`);
                    if (res.data && res.data.nome) {
                      setCnpjJaCadastrado(`CNPJ já cadastrado para a empresa: ${res.data.nome}`);
                      return;
                    }
                  } catch (err: any) {
                    if (err.response && err.response.status === 404) {
                      setCnpjJaCadastrado(null);
                    }
                  }
                  // Se não existe, busca na Speedio
                  await buscarCnpjSpeedio(cnpj);
                }}
                required
                error={deveMostrarErroCnpj || !!cnpjJaCadastrado}
                helperText={deveMostrarErroCnpj ? 'CNPJ inválido' : (cnpjJaCadastrado || '')}
                inputProps={{ maxLength: 18, inputMode: 'text' }}
                size="medium"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="E-mail do admin" type="email" value={email} onChange={e => setEmail(e.target.value)} required size="medium" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Senha do admin" type="password" value={senha} onChange={e => setSenha(e.target.value)} required size="medium" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="CEP" value={cep} onChange={e => setCep(e.target.value)} onBlur={buscarCep} inputProps={{ maxLength: 9 }} size="medium" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} size="medium" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Número" value={numero} onChange={e => setNumero(e.target.value)} size="medium" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} size="medium" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Cidade" value={cidade} onChange={e => setCidade(e.target.value)} size="medium" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="UF" value={uf} onChange={e => setUf(e.target.value)} inputProps={{ maxLength: 2 }} size="medium" />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ fontWeight: 700, mt: 1 }} disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button variant="text" color="primary" fullWidth sx={{ fontWeight: 600 }} onClick={() => window.location.href = '/login'}>
                Já tenho cadastro? Fazer login
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}