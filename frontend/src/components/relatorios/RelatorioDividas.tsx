import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  Grid,
  Button,
  ButtonGroup
} from '@mui/material';
import { PictureAsPdf as PdfIcon, TableChart as ExcelIcon } from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';

interface Divida {
  id: number;
  id_cliente: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: string;
  protocolo?: string;
  empresa?: string;
  cnpj_empresa?: string;
}

interface RelatorioDividas {
  totalDividas: number;
  valorTotal: number;
  dividasPorStatus: {
    pendente: number;
    pago: number;
    cancelado: number;
  };
  dividas: Divida[];
}

export const RelatorioDividas: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioDividas | null>(null);

  const fetchRelatorio = async () => {
    try {
      setLoading(true);
      const response = await api.get<RelatorioDividas>('/relatorios/dividas');
      setRelatorio(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar relatório de dívidas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorio();
  }, []);

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/relatorios/dividas/pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'dividas.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erro ao exportar relatório em PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/relatorios/dividas/excel', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'dividas.xlsx');
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

  return (
    <Box p={0}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Relatório de Dívidas
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

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total de Dívidas
                </Typography>
                <Typography variant="h4">
                  {relatorio.totalDividas}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Valor Total
                </Typography>
                <Typography variant="h4">
                  {formatCurrency(relatorio.valorTotal)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Status das Dívidas
                </Typography>
                <Typography variant="body1">
                  Pendentes: {relatorio.dividasPorStatus.pendente}
                </Typography>
                <Typography variant="body1">
                  Pagas: {relatorio.dividasPorStatus.pago}
                </Typography>
                <Typography variant="body1">
                  Canceladas: {relatorio.dividasPorStatus.cancelado}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Protocolo</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>CNPJ da Empresa</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Data Vencimento</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relatorio.dividas.map((divida) => (
                <TableRow key={divida.id}>
                  <TableCell>{divida.protocolo || '—'}</TableCell>
                  <TableCell>{divida.empresa || '—'}</TableCell>
                  <TableCell>{divida.cnpj_empresa || '—'}</TableCell>
                  <TableCell>{divida.descricao}</TableCell>
                  <TableCell>{formatCurrency(divida.valor)}</TableCell>
                  <TableCell>{divida.data_vencimento ? new Date(divida.data_vencimento).toLocaleDateString('pt-BR') : '—'}</TableCell>
                  <TableCell>{divida.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}; 