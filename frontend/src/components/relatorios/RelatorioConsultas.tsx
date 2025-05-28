import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert
} from '@mui/material';
import { PictureAsPdf as PdfIcon, TableChart as ExcelIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import api from '../../services/api';

interface Consulta {
  id: number;
  cpf_consultado: string;
  data_consulta: string;
  resultado: string;
}

interface RelatorioConsultas {
  totalConsultas: number;
  consultasPorPeriodo: Array<{
    data: string;
    quantidade: number;
  }>;
  consultas: Consulta[];
}

export const RelatorioConsultas: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioConsultas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);

  const fetchRelatorio = async () => {
    if (!dataInicio || !dataFim) return;

    try {
      setLoading(true);
      const response = await api.get<RelatorioConsultas>('/relatorios/consultas', {
        params: {
          dataInicio: dataInicio.toISOString(),
          dataFim: dataFim.toISOString()
        }
      });
      setRelatorio(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar relatório de consultas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataInicio && dataFim) {
      fetchRelatorio();
    }
  }, [dataInicio, dataFim]);

  const handleExportPDF = async () => {
    if (!dataInicio || !dataFim) return;

    try {
      const response = await api.get('/relatorios/consultas/pdf', {
        responseType: 'blob',
        params: {
          dataInicio: dataInicio.toISOString(),
          dataFim: dataFim.toISOString()
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'consultas.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erro ao exportar relatório em PDF');
    }
  };

  const handleExportExcel = async () => {
    if (!dataInicio || !dataFim) return;

    try {
      const response = await api.get('/relatorios/consultas/excel', {
        responseType: 'blob',
        params: {
          dataInicio: dataInicio.toISOString(),
          dataFim: dataFim.toISOString()
        }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'consultas.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Erro ao exportar relatório em Excel');
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Relatório de Consultas
          </Typography>
          <ButtonGroup variant="contained">
            <Button
              startIcon={<PdfIcon />}
              onClick={handleExportPDF}
              color="error"
              disabled={!dataInicio || !dataFim}
            >
              Exportar PDF
            </Button>
            <Button
              startIcon={<ExcelIcon />}
              onClick={handleExportExcel}
              color="success"
              disabled={!dataInicio || !dataFim}
            >
              Exportar Excel
            </Button>
          </ButtonGroup>
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Data Início"
              value={dataInicio}
              onChange={(newValue) => setDataInicio(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="Data Fim"
              value={dataFim}
              onChange={(newValue) => setDataFim(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : relatorio ? (
          <>
            <Box mb={3}>
              <Typography variant="h6">
                Total de Consultas: {relatorio.totalConsultas}
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>CPF Consultado</TableCell>
                    <TableCell>Resultado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatorio.consultas.map((consulta) => (
                    <TableRow key={consulta.id}>
                      <TableCell>
                        {new Date(consulta.data_consulta).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{consulta.cpf_consultado}</TableCell>
                      <TableCell>{consulta.resultado}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : null}
      </Paper>
    </Box>
  );
}; 