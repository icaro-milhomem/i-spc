import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();
const usuarioController = new UsuarioController();

router.post('/', authenticateJWT, isAdmin, usuarioController.criar);
router.get('/', authenticateJWT, isAdmin, usuarioController.listar);
router.get('/:id', authenticateJWT, isAdmin, usuarioController.buscarPorId);
router.put('/:id', authenticateJWT, isAdmin, usuarioController.atualizar);
router.delete('/:id', authenticateJWT, isAdmin, usuarioController.deletar);

export default router; 