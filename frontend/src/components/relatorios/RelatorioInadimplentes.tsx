import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  ButtonGroup
} from '@mui/material';
import { PictureAsPdf as PdfIcon, TableChart as ExcelIcon } from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';

interface Inadimplente {
  cliente: {
    id: number;
    cpf: string;
    nome: string;
    telefone: string;
    status: string;
  };
  dividas: Array<{
    id: number;
    descricao: string;
    valor: number;
    data_vencimento: string;
    status: string;
    protocolo?: string;
    empresa?: string;
    cnpj_empresa?: string;
  }>;
  ultimaConsulta?: {
    id: number;
    data_consulta: string;
    resultado: string;
  };
}

interface RelatorioInadimplentes {
  totalInadimplentes: number;
  valorTotalDividas: number;
  inadimplentes: Inadimplente[];
}

// Agrupa todas as dívidas por empresa
function obterDividasPorEmpresa(inadimplentes: Inadimplente[]) {
  const dividasPorEmpresa: Record<string, any[]> = {};
  inadimplentes.forEach((inadimplente) => {
    inadimplente.dividas.forEach((divida) => {
      const empresa = divida.empresa || 'Sem empresa';
      if (!dividasPorEmpresa[empresa]) dividasPorEmpresa[empresa] = [];
      dividasPorEmpresa[empresa].push({
        cliente: inadimplente.cliente,
        divida,
        ultimaConsulta: inadimplente.ultimaConsulta
      });
    });
  });
  return dividasPorEmpresa;
}

export const RelatorioInadimplentes: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioInadimplentes | null>(null);

  const fetchRelatorio = async () => {
    try {
      setLoading(true);
      const response = await api.get<RelatorioInadimplentes>('/relatorios/inadimplentes');
      setRelatorio(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar relatório de inadimplentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorio();
  }, []);

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/relatorios/inadimplentes/pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inadimplentes.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erro ao exportar relatório em PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/relatorios/inadimplentes/excel', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inadimplentes.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erro ao exportar relatório em Excel');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!relatorio) {
    return null;
  }

  // Obtem as dívidas agrupadas por empresa
  const dividasPorEmpresa = obterDividasPorEmpresa(relatorio.inadimplentes);

  return (
    <Box p={0}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Relatório de Inadimplentes
          </Typography>
          <ButtonGroup variant="contained">
            <Button
              startIcon={<PdfIcon />}
              onClick={handleExportPDF}
              color="error"
            >
              Exportar PDF
            </Button>
            <Button
              startIcon={<ExcelIcon />}
              onClick={handleExportExcel}
              color="success"
            >
              Exportar Excel
            </Button>
          </ButtonGroup>
        </Box>

        <Box mb={3}>
          <Typography variant="h6">
            Total de Inadimplentes: {relatorio.totalInadimplentes}
          </Typography>
          <Typography variant="h6">
            Valor Total das Dívidas: {formatCurrency(relatorio.valorTotalDividas)}
          </Typography>
        </Box>

        {/* Renderiza as dívidas agrupadas por empresa */}
        {Object.entries(dividasPorEmpresa).map(([empresa, dividas]) => (
          <Box key={empresa} mb={4}>
            <Typography variant="h5" sx={{ mb: 2 }}>{empresa}</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Descrição da Dívida</TableCell>
                    <TableCell>Protocolo</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>CNPJ da Empresa</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Última Consulta</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(dividas as any[]).map(({ cliente, divida, ultimaConsulta }) => (
                    <TableRow key={divida.id}>
                      <TableCell>{cliente.nome}</TableCell>
                      <TableCell>{cliente.cpf}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>{divida.descricao}</TableCell>
                      <TableCell>{divida.protocolo || '—'}</TableCell>
                      <TableCell>{divida.empresa || '—'}</TableCell>
                      <TableCell>{divida.cnpj_empresa || '—'}</TableCell>
                      <TableCell>{formatCurrency(divida.valor)}</TableCell>
                      <TableCell>{ultimaConsulta?.data_consulta || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}; 