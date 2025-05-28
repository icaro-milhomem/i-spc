import { Router } from 'express';
import { NotificacaoController } from '../controllers/NotificacaoController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const notificacaoController = new NotificacaoController();

router.get('/', authenticateJWT, notificacaoController.listar);
router.post('/', authenticateJWT, notificacaoController.criar);
router.patch('/:id/status', authenticateJWT, notificacaoController.atualizarStatus);

export default router; 