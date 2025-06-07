import { Box, Typography, Paper } from '@mui/material';

export default function AdminConfig() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Configurações do sistema em desenvolvimento...
        </Typography>
      </Paper>
    </Box>
  );
} 