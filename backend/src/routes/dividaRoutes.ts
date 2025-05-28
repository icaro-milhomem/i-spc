import { Router } from 'express';
import { DividaController } from '../controllers/DividaController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const dividaController = new DividaController();

router.post('/', authenticateJWT, dividaController.criar);
router.get('/cliente/:cliente_id', authenticateJWT, dividaController.buscarPorCliente);
router.patch('/:id/status', authenticateJWT, dividaController.atualizarStatus);
router.put('/:id', authenticateJWT, dividaController.atualizar);
router.get('/:id', authenticateJWT, dividaController.buscarPorId);

export default router; 