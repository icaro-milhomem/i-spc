import { Router } from 'express';
import { PermissaoController } from '../controllers/PermissaoController';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();
const permissaoController = new PermissaoController();

router.post('/', authenticateJWT, isAdmin, permissaoController.criar);
router.get('/', authenticateJWT, permissaoController.listar);
router.get('/:id', authenticateJWT, permissaoController.buscarPorId);
router.put('/:id', authenticateJWT, isAdmin, permissaoController.atualizar);
router.delete('/:id', authenticateJWT, isAdmin, permissaoController.deletar);

export default router; 