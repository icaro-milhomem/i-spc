import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
import api from '../services/api';

interface Divida {
  id?: number;
  clienteId: number | '';
  valor: number;
  dataVencimento: string;
  status: string;
  descricao: string;
  ativo: boolean;
  nome_devedor: string;
  cpf_cnpj_devedor: string;
  protocolo?: string;
  empresa?: string;
  cnpj_empresa?: string;
  status_negativado?: boolean;
  created_at?: string;
  podeEditar?: boolean;
  tenant?: {
    id: number;
    nome: string;
    cnpj: string;
  };
}

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  permissoes?: { podeEditar: boolean };
}

const OPCOES_SERVICOS = [
  { key: 'roteador', label: 'Roteador', campos: ['valor', 'marca'] },
  { key: 'mensalidade', label: 'Mensalidade', campos: ['valor', 'data'] },
  { key: 'onu', label: 'ONU', campos: ['valor', 'marca'] },
  { key: 'ont', label: 'ONT', campos: ['valor', 'marca'] }
];

const DividaForm: React.FC = () => {
  const { id: clienteId, idDivida } = useParams<{ id: string; idDivida?: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState<Divida>({
    clienteId: '',
    valor: 0,
    dataVencimento: new Date().toISOString().split('T')[0],
    descricao: '',
    ativo: true,
    nome_devedor: '',
    cpf_cnpj_devedor: '',
    status: 'PENDENTE'
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [servicos, setServicos] = useState<{ [key: string]: { checked: boolean; valor: string; marca?: string; data?: string } }>({
    roteador: { checked: false, valor: '', marca: '' },
    mensalidade: { checked: false, valor: '', data: new Date().toISOString().slice(0, 7) },
    onu: { checked: false, valor: '', marca: '' },
    ont: { checked: false, valor: '', marca: '' }
  });
  const [servicoEditando, setServicoEditando] = useState<string | null>(null);
  const [enderecoDialogOpen, setEnderecoDialogOpen] = useState(false);
  const [novoEndereco, setNovoEndereco] = useState({
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: ''
  });

  useEffect(() => {
    const inicializar = async () => {
      try {
        await carregarClientes();
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      }
    };
    inicializar();
  }, []);

  useEffect(() => {
    const preencherCampos = async () => {
      if (idDivida && idDivida !== 'nova') {
        await carregarDivida();
      } else if (clienteId && clientes.length > 0) {
        const clienteSelecionado = (clientes as Cliente[]).find((c: Cliente) => c.id === Number(clienteId));
        // Busca empresa do usuário logado (rota correta)
        let empresa: { nome?: string; cnpj?: string } | null = null;
        try {
          const empresaResp = await api.get('/tenants/minha');
          empresa = empresaResp.data;
        } catch (e) {
          empresa = null;
        }
        const protocolo = `PRT-${Date.now()}`;
        setFormData(prev => ({
          ...prev,
          clienteId: Number(clienteId),
          nome_devedor: clienteSelecionado ? clienteSelecionado.nome : '',
          cpf_cnpj_devedor: clienteSelecionado ? clienteSelecionado.cpf : '',
          protocolo,
          empresa: empresa?.nome || '',
          cnpj_empresa: empresa?.cnpj || ''
        }));
      }
    };
    preencherCampos();
  }, [idDivida, clienteId, clientes]);

  useEffect(() => {
    const valorTotal = OPCOES_SERVICOS
      .filter(s => servicos[s.key].checked && servicos[s.key].valor)
      .reduce((acc, s) => acc + valorMonetarioParaNumero(servicos[s.key].valor), 0);

    // Monta descrição automática
    const partes: string[] = [];
    OPCOES_SERVICOS.forEach(servico => {
      if (servicos[servico.key].checked) {
        let desc = servico.label;
        if (servicos[servico.key].valor) {
          desc += ` R$ ${servicos[servico.key].valor}`;
        }
        if (servico.key === 'mensalidade' && servicos[servico.key].data) {
          let mes = '', ano = '';
          const data = servicos[servico.key].data || '';
          if (data.includes('-')) {
            const partes = data.split('-');
            if (partes.length >= 2) {
              ano = partes[0];
              mes = partes[1];
            }
          } else if (data.includes('/')) {
            const partes = data.split('/');
            if (partes.length === 3) {
              mes = partes[1];
              ano = partes[2];
            }
          }
          if (mes && ano) desc += `: ${mes}/${ano}`;
        }
        if (servicos[servico.key].marca) {
          desc += `, Marca: ${servicos[servico.key].marca}`;
        }
        partes.push(desc);
      }
    });

    setFormData(prev => ({
      ...prev,
      valor: valorTotal,
      descricao: partes.join(' | ')
    }));
  }, [servicos]);

  const carregarClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data.clientes);
      if (!idDivida && response.data.clientes.length > 0) {
        setFormData(prev => ({
          ...prev,
          clienteId: response.data.clientes[0].id
        }));
      }
    } catch (error) {
      setError('Erro ao carregar clientes');
      console.error('Erro:', error);
    }
  };

  const carregarDivida = async () => {
    try {
      const response = await api.get(`/dividas/${idDivida}`);
      const dados = response.data;
      setFormData(prev => ({
        ...prev,
        clienteId: dados.cliente_id || '',
        valor: dados.valor ? Number(dados.valor) : 0,
        dataVencimento: dados.data_vencimento
          ? new Date(dados.data_vencimento).toISOString().split('T')[0]
          : prev.dataVencimento,
        status: dados.status ? dados.status.toUpperCase() : 'PENDENTE',
        descricao: dados.descricao || '',
        ativo: typeof dados.ativo === 'boolean' ? dados.ativo : true,
        nome_devedor: dados.nome_devedor || '',
        cpf_cnpj_devedor: dados.cpf_cnpj_devedor || '',
        protocolo: dados.protocolo || '',
        empresa: dados.empresa || '',
        cnpj_empresa: dados.cnpj_empresa || '',
        status_negativado: dados.status_negativado,
        created_at: dados.created_at,
        podeEditar: dados.podeEditar,
        tenant: dados.tenant
      }));
    } catch (error: any) {
      if (error.response?.status === 404) {
        navigate(`/clientes/${clienteId}/dividas`);
        return;
      }
      setError('Erro ao carregar dados da dívida');
      console.error('Erro:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    
    try {
      // Monta descrição e valor total a partir dos serviços marcados
      const descricaoServicos = OPCOES_SERVICOS.filter(s => servicos[s.key].checked)
        .map(s => {
          const servico = servicos[s.key];
          if (!servico) return '';

          if (s.key === 'mensalidade') {
            const valor = servico.valor ? `R$ ${servico.valor}` : '';
            const data = servico.data ? servico.data.split('-') : [];
            const mes = data[1] || '';
            const ano = data[0] || '';
            return `Mensalidade ${valor}: ${mes}/${ano}`;
          } else {
            const valor = servico.valor ? `R$ ${servico.valor}` : '';
            const marca = servico.marca ? `Marca: ${servico.marca}` : '';
            return [s.label, valor, marca].filter(Boolean).join(' ');
          }
        })
        .join(' | ');

      const valorTotal = OPCOES_SERVICOS.filter(s => servicos[s.key].checked)
        .reduce((acc, s) => {
          const servico = servicos[s.key];
          return servico ? acc + valorMonetarioParaNumero(servico.valor) : acc;
        }, 0);

      const payload = {
        cliente_id: formData.clienteId,
        nome_devedor: formData.nome_devedor,
        cpf_cnpj_devedor: formData.cpf_cnpj_devedor,
        valor: valorTotal > 0 ? valorTotal.toFixed(2) : formData.valor,
        descricao: descricaoServicos || formData.descricao,
        data_vencimento: formData.dataVencimento ? new Date(formData.dataVencimento).toISOString().split('T')[0] : undefined
      };

      console.log('Payload enviado para o backend:', payload);

      if (idDivida && idDivida !== 'nova') {
        await api.put(`/dividas/${idDivida}`, payload);
      } else {
        await api.post('/dividas', payload);
      }

      // Invalida o cache antes de redirecionar
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('dividas_cache')) {
          localStorage.removeItem(key);
        }
      });

      // Redireciona imediatamente
      navigate(`/clientes/${formData.clienteId}/dividas`);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar dívida');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string | number>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    // Se mudou o cliente, atualiza nome_devedor e cpf_cnpj_devedor automaticamente
    if (name === 'clienteId') {
      const clienteSelecionado = clientes.find(c => c.id === Number(value));
      setFormData(prev => ({
        ...prev,
        clienteId: value === '' ? '' : Number(value),
        nome_devedor: clienteSelecionado ? clienteSelecionado.nome : '',
        cpf_cnpj_devedor: clienteSelecionado ? clienteSelecionado.cpf : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name as string]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleServicoCheck = (key: string) => {
    setServicos(prev => {
      const checked = !prev[key].checked;
      return { ...prev, [key]: { ...prev[key], checked } };
    });
  };

  const handleServicoCampoChange = (key: string, campo: string, valor: string) => {
    if (campo === 'valor') {
      // Formata automaticamente o valor monetário
      valor = formatarValorMonetario(valor);
    }
    setServicos(prev => ({ ...prev, [key]: { ...prev[key], [campo]: valor } }));
  };

  // Função para formatar valor monetário ao digitar
  function formatarValorMonetario(valor: string) {
    // Remove tudo que não for número
    let limpo = valor.replace(/[^\d]/g, '');
    if (!limpo) return '';
    // Adiciona zeros à esquerda se necessário
    while (limpo.length < 3) limpo = '0' + limpo;
    // Insere vírgula antes dos dois últimos dígitos
    const parteInteira = limpo.slice(0, -2);
    const parteDecimal = limpo.slice(-2);
    return `${Number(parteInteira)}${parteDecimal ? ',' + parteDecimal : ''}`;
  }

  const handleServicoEdit = (key: string) => {
    const servico = servicos[key];
    if (servico) {
      setServicoEditando(key);
    }
  };

  // Função para converter valor monetário string para número
  function valorMonetarioParaNumero(valor: string) {
    if (!valor) return 0;
    // Remove tudo que não for número ou vírgula
    let limpo = valor.replace(/[^\d,]/g, '');
    if (!limpo) return 0;
    // Se o valor já contém vírgula, converte para float corretamente
    if (limpo.includes(',')) {
      return parseFloat(limpo.replace('.', '').replace(',', '.'));
    }
    // Caso contrário, trata como centavos
    return Number(limpo) / 100;
  }

  const handleNovoEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNovoEndereco(prev => ({ ...prev, [name]: value }));
  };

  const handleNovoEnderecoCepBlur = async () => {
    if (novoEndereco.cep.length < 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${novoEndereco.cep.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setNovoEndereco(prev => ({
          ...prev,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }));
      }
    } catch (e) {
      // Silencioso
    }
  };

  const handleNovoEnderecoSubmit = async () => {
    try {
      await api.post(`/enderecos/cliente/${formData.clienteId}`, novoEndereco);
      setEnderecoDialogOpen(false);
      setNovoEndereco({ cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });
    } catch (error) {
      setError('Erro ao adicionar endereço');
    }
  };

  return (
    <Box sx={{ mt: -6, display: 'flex', justifyContent: 'center', background: theme.palette.background.default, minHeight: '100vh' }}>
      <Box sx={{ width: '100%', minWidth: 544, maxWidth: 1044, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
          {idDivida && idDivida !== 'nova' ? 'Editar Dívida' : 'Nova Dívida'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={formData.clienteId}
                  name="clienteId"
                  onChange={handleChange}
                  required
                  sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
                >
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.id} value={cliente.id}>
                      {cliente.nome} - {cliente.cpf}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Nome do Devedor"
                name="nome_devedor"
                value={formData.nome_devedor}
                onChange={handleChange}
                fullWidth
                required
                disabled={Boolean(clienteId)}
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="CPF/CNPJ do Devedor"
                name="cpf_cnpj_devedor"
                value={formData.cpf_cnpj_devedor}
                onChange={handleChange}
                fullWidth
                required
                disabled={Boolean(clienteId)}
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Protocolo"
                name="protocolo"
                value={formData.protocolo ?? ''}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: true }}
                fullWidth
                required
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Empresa"
                name="empresa"
                value={formData.empresa ?? ''}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: true }}
                fullWidth
                required
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="CNPJ da Empresa"
                name="cnpj_empresa"
                value={formData.cnpj_empresa ?? ''}
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: true }}
                fullWidth
                required
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
              />
            </Grid>

            {(() => {
              const cliente = clientes.find(c => c.id === formData.clienteId);
              return clientes.length > 0 && cliente?.permissoes?.podeEditar === false && (
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mb: 2, mr: 2, width: 'auto', px: 4, py: 1, borderRadius: 2 }}
                    onClick={() => setEnderecoDialogOpen(true)}
                  >
                    Adicionar Novo Endereço
                  </Button>
                </Grid>
              );
            })()}

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, color: theme.palette.text.primary }}>
                Serviços
              </Typography>
              <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                {OPCOES_SERVICOS.map(servico => (
                  <FormControlLabel
                    key={servico.key}
                    control={
                      <Checkbox
                        checked={servicos[servico.key].checked}
                        onChange={() => {
                          handleServicoCheck(servico.key);
                          if (!servicos[servico.key].checked) handleServicoEdit(servico.key);
                        }}
                        color="primary"
                        disabled={submitting}
                      />
                    }
                    label={servico.label}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Valor"
                name="valor"
                value={Number(formData.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                onChange={handleChange}
                fullWidth
                disabled
                required
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Data de Vencimento"
                name="dataVencimento"
                type="date"
                value={formData.dataVencimento}
                onChange={handleChange}
                fullWidth
                disabled={submitting}
                InputLabelProps={{ shrink: true }}
                required
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descrição"
                name="descricao"
                value={formData.descricao ?? ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
                required
                sx={{ borderRadius: 2, input: { color: theme.palette.text.primary }, label: { color: theme.palette.text.secondary } }}
                InputProps={{ style: { color: theme.palette.text.primary } }}
                InputLabelProps={{ style: { color: theme.palette.text.secondary } }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.ativo}
                    onChange={handleChange}
                    name="ativo"
                    color="primary"
                    disabled={submitting}
                  />
                }
                label="Ativo"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={submitting}
                sx={{ mt: 2, borderRadius: 2, fontWeight: 700, fontSize: 18 }}
              >
                {submitting ? 'Salvando...' : 'Salvar Dívida'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Dialog open={enderecoDialogOpen} onClose={() => setEnderecoDialogOpen(false)}>
        <DialogTitle>Adicionar Novo Endereço</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="CEP"
                name="cep"
                value={novoEndereco.cep}
                onChange={handleNovoEnderecoChange}
                onBlur={handleNovoEnderecoCepBlur}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Rua"
                name="rua"
                value={novoEndereco.rua}
                onChange={handleNovoEnderecoChange}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Número"
                name="numero"
                value={novoEndereco.numero}
                onChange={handleNovoEnderecoChange}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Complemento"
                name="complemento"
                value={novoEndereco.complemento}
                onChange={handleNovoEnderecoChange}
                fullWidth
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Bairro"
                name="bairro"
                value={novoEndereco.bairro}
                onChange={handleNovoEnderecoChange}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Cidade"
                name="cidade"
                value={novoEndereco.cidade}
                onChange={handleNovoEnderecoChange}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Estado"
                name="estado"
                value={novoEndereco.estado}
                onChange={handleNovoEnderecoChange}
                fullWidth
                required
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnderecoDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleNovoEnderecoSubmit} variant="contained" color="primary">Adicionar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!servicoEditando} onClose={() => setServicoEditando(null)}>
        <DialogTitle>Preencha os dados do serviço</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {servicoEditando && OPCOES_SERVICOS.find(s => s.key === servicoEditando)?.campos.map(campo => {
              const servico = servicos[servicoEditando];
              if (!servico) return null;

              let valor = '';
              if (campo === 'valor') {
                valor = formatarValorMonetario(String(servico.valor ?? ''));
              } else if (campo === 'data' && servicoEditando === 'mensalidade') {
                valor = servico.data || '';
              } else if (campo === 'marca') {
                valor = servico.marca || '';
              }

              return (
                <Grid item xs={12} key={campo}>
                  <TextField
                    label={campo.charAt(0).toUpperCase() + campo.slice(1)}
                    name={campo}
                    type={campo === 'data' && servicoEditando === 'mensalidade' ? 'month' : 'text'}
                    value={valor}
                    onChange={e => {
                      let novoValor = e.target.value;
                      if (campo === 'valor') {
                        novoValor = novoValor.replace(/[^\d,\.]/g, '');
                      }
                      handleServicoCampoChange(servicoEditando, campo, novoValor);
                    }}
                    fullWidth
                    sx={{ borderRadius: 2, mb: 2 }}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServicoEditando(null)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DividaForm;