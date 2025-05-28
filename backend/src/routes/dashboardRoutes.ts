import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

// Rota para obter dados do dashboard
router.get('/resumo', authenticateJWT, dashboardController.obterResumo);
router.get('/dividas-vencidas', authenticateJWT, dashboardController.obterDividasVencidas);
router.get('/dividas-por-status', authenticateJWT, dashboardController.obterDividasPorStatus);
router.get('/dividas-por-mes', authenticateJWT, dashboardController.obterDividasPorMes);

router.get('/stats', authenticateJWT, async (req, res) => {
  // Exemplo de resposta fake, ajuste conforme sua lógica
  res.json({
    totalUsuarios: 10,
    totalClientes: 20,
    totalDividas: 5
  });
});

export default router; 