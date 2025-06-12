import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Chip,
} from '@mui/material';
import api from '../services/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface Divida {
  id: number;
  valor: number;
  dataVencimento: string;
  data_vencimento?: string;
  status: string;
  protocolo?: string;
  empresa?: string;
  cnpj_empresa?: string;
  tenant?: {
    id: number;
    nome: string;
    cnpj: string;
    logo: string;
  };
}

export const ConsultaCPF: React.FC = () => {
  const [busca, setBusca] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!busca.trim()) {
      setError('Digite nome ou CPF');
      return;
    }
    setLoading(true);
    try {
      let params: any = {};
      if (/^[0-9]+$/.test(busca.trim())) {
        params.cpf = busca.trim();
      } else {
        params.nome = busca.trim();
      }
      const response = await api.get('/clientes/consulta', { params });
      setResult(response.data);
      // Registrar a consulta no backend
      if (response.data && response.data.cpf) {
        await api.post('/consultas/registrar', {
          cpf: response.data.cpf,
          tipo: 'consulta_cpf',
          observacoes: 'Consulta realizada pela tela de consulta'
        });
      }
      setSuccessMessage('Consulta realizada com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao consultar');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Extrato do Cliente', 14, 20);

    // Dados do cliente
    doc.setFontSize(12);
    doc.text(`Nome: ${result.nome}`, 14, 30);
    doc.text(`CPF: ${result.cpf}`, 14, 38);

    // Endereço principal
    if (result.endereco) {
      const end = result.endereco;
      doc.text(
        `Endereço: ${end.rua || ''}, ${end.numero || ''} ${end.complemento || ''} - ${end.bairro || ''} - ${end.cidade || ''} - ${end.estado || ''} - CEP: ${end.cep || ''}`,
        14,
        46
      );
    }

    // Endereços adicionais
    let y = 54;
    if (result.enderecosAdicionais && result.enderecosAdicionais.length > 0) {
      result.enderecosAdicionais.forEach((end: any, idx: number) => {
        doc.text(
          `Endereço adicional ${idx + 1}: ${end.rua || ''}, ${end.numero || ''} ${end.complemento || ''} - ${end.bairro || ''} - ${end.cidade || ''} - ${end.estado || ''} - CEP: ${end.cep || ''}`,
          14,
          y
        );
        y += 8;
      });
    }

    // Tabela de dívidas
    autoTable(doc, {
      startY: y + 8,
      head: [['Protocolo', 'Empresa', 'CNPJ', 'Valor', 'Vencimento', 'Status']],
      body: result.dividas.map((divida: any) => [
        divida.protocolo || '—',
        divida.empresa || divida.tenant?.nome || '—',
        divida.cnpj_empresa || divida.tenant?.cnpj || '—',
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(divida.valor),
        (divida.data_vencimento || divida.dataVencimento)
          ? new Date(divida.data_vencimento || divida.dataVencimento).toLocaleDateString('pt-BR')
          : '—',
        divida.status ? divida.status.toUpperCase() : 'PENDENTE'
      ]),
    });

    doc.save(`extrato-${result.cpf || result.nome}.pdf`);
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Consultar Cliente
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'flex-end' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            placeholder="Buscar por CPF ou nome do cliente..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            sx={{ width: 260, mr: 2 }}
            autoComplete="off"
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
          >
            Buscar
          </Button>
        </form>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Snackbar
          open={!!successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(null)}
        >
          <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}
      {result && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mb: 2 }}
            onClick={handleExportPDF}
          >
            Salvar Extrato em PDF
          </Button>
          <div id="extrato-cliente">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Resultado da Consulta
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>CPF:</strong> {result.cpf}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <strong>Nome:</strong> {result.nome}
                {result.dividas && result.dividas.length > 0 ? (
                  <CancelIcon sx={{ color: 'error.main', ml: 1 }} titleAccess="Cliente inadimplente" />
                ) : (
                  <CheckCircleIcon sx={{ color: 'success.main', ml: 1 }} titleAccess="Cliente sem dívidas" />
                )}
              </Typography>
              {result.endereco && (
                <Typography variant="body1" gutterBottom>
                  <strong>Endereço:</strong> {`${result.endereco.rua || ''}, ${result.endereco.numero || ''} ${result.endereco.complemento || ''} - ${result.endereco.bairro || ''} - ${result.endereco.cidade || ''} - ${result.endereco.estado || ''} - CEP: ${result.endereco.cep || ''}`}
                </Typography>
              )}
              {result.enderecosAdicionais && result.enderecosAdicionais.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  {result.enderecosAdicionais.map((end: any, idx: number) => (
                    <Typography variant="body1" gutterBottom key={idx}>
                      <strong>Endereço adicional {idx + 1}:</strong> {`${end.rua || ''}, ${end.numero || ''} ${end.complemento || ''} - ${end.bairro || ''} - ${end.cidade || ''} - ${end.estado || ''} - CEP: ${end.cep || ''}`}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
            {result.dividas && result.dividas.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Logo</TableCell>
                      <TableCell>Protocolo</TableCell>
                      <TableCell>Empresa</TableCell>
                      <TableCell>CNPJ da Empresa</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Vencimento</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.dividas.map((divida: Divida) => (
                      <TableRow key={divida.id}>
                        <TableCell>
                          {divida.tenant && divida.tenant.logo ? (
                            <img src={divida.tenant.logo} alt="Logo da empresa" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', background: '#222' }} />
                          ) : (
                            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'grey.800', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>
                              —
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>{divida.protocolo || '—'}</TableCell>
                        <TableCell>{divida.empresa || divida.tenant?.nome || '—'}</TableCell>
                        <TableCell>{divida.cnpj_empresa || divida.tenant?.cnpj || '—'}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(divida.valor)}
                        </TableCell>
                        <TableCell>
                          {(divida.data_vencimento || divida.dataVencimento) && !isNaN(new Date(divida.data_vencimento || divida.dataVencimento).getTime())
                            ? new Date(divida.data_vencimento || divida.dataVencimento).toLocaleDateString('pt-BR')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={divida.status ? divida.status.toUpperCase() : 'PENDENTE'}
                            color={
                              divida.status === 'PENDENTE'
                                ? 'warning'
                                : divida.status === 'PAGO'
                                ? 'success'
                                : divida.status === 'CANCELADO'
                                ? 'default'
                                : 'default'
                            }
                            sx={{
                              fontWeight: 700,
                              fontSize: 13,
                              px: 2,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null}
          </div>
        </Box>
      )}
    </Box>
  );
};