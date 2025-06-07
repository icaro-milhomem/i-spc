import { Box, Typography, Paper } from '@mui/material';

export default function SuperAdminConfig() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações do Sistema
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Configurações globais do sistema em desenvolvimento...
        </Typography>
      </Paper>
    </Box>
  );
} 