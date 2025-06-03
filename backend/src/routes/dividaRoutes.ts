import { Router } from 'express';
import { DividaController } from '../controllers/DividaController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, DividaController.criar);
router.get('/cliente/:cliente_id', authenticateJWT, DividaController.listar);
router.get('/consultar/:cpf_cnpj', DividaController.consultarPorCpfCnpj);
router.put('/editar/:id', authenticateJWT, DividaController.editar);
router.delete('/remover/:id', authenticateJWT, DividaController.remover);
router.get('/:id', authenticateJWT, DividaController.buscarPorId);
router.put('/:id', authenticateJWT, DividaController.editar);

export default router;