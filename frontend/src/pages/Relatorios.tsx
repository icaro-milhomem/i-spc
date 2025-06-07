import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { RelatorioInadimplentes } from '../components/relatorios/RelatorioInadimplentes';
import { RelatorioConsultas } from '../components/relatorios/RelatorioConsultas';
import { RelatorioDividas } from '../components/relatorios/RelatorioDividas';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`relatorio-tabpanel-${index}`}
      aria-labelledby={`relatorio-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const Relatorios: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h4" gutterBottom>
        Relatórios
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Inadimplentes" />
          <Tab label="Consultas" />
          <Tab label="Dívidas" />
        </Tabs>
        <TabPanel value={value} index={0}>
          <RelatorioInadimplentes />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <RelatorioConsultas />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <RelatorioDividas />
        </TabPanel>
      </Paper>
    </Box>
  );
}; 