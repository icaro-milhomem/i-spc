import { Router } from 'express';
import { DividaController } from '../controllers/DividaController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const dividaController = new DividaController();

router.post('/', authenticateJWT, dividaController.criar.bind(dividaController));
router.get('/cliente/:cliente_id', authenticateJWT, dividaController.buscarPorCliente.bind(dividaController));
router.patch('/:id/status', authenticateJWT, dividaController.atualizarStatus.bind(dividaController));
router.put('/:id', authenticateJWT, dividaController.atualizar.bind(dividaController));
router.get('/:id', authenticateJWT, dividaController.buscarPorId.bind(dividaController));
router.delete('/:id', authenticateJWT, dividaController.deletar.bind(dividaController));

export default router;