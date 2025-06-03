import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

// Rota para obter dados do dashboard
router.get('/resumo', authenticateJWT, dashboardController.obterResumo);
router.get('/stats', authenticateJWT, dashboardController.obterStats.bind(dashboardController));

export default router;