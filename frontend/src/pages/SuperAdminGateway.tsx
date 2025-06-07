import { Box, Typography, Paper } from '@mui/material';

export default function SuperAdminGateway() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gateway de Pagamento Global
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Configurações globais do gateway de pagamento em desenvolvimento...
        </Typography>
      </Paper>
    </Box>
  );
} 