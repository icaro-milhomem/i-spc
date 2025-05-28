import { Router } from 'express';
import { LogController } from '../controllers/LogController';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();
const logController = new LogController();

router.get('/', authenticateJWT, isAdmin, logController.listar);
router.get('/:id', authenticateJWT, isAdmin, logController.buscarPorId);
router.delete('/:id', authenticateJWT, isAdmin, logController.deletar);

export default router; 