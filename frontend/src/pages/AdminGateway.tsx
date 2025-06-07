import { Box, Typography, Paper } from '@mui/material';

export default function AdminGateway() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gateway de Pagamento
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Configurações do gateway de pagamento em desenvolvimento...
        </Typography>
      </Paper>
    </Box>
  );
} 