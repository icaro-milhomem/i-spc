import { Router } from 'express';
import { UsuarioController } from '../controllers/UsuarioController';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();
const usuarioController = new UsuarioController();

// Rotas específicas primeiro
router.put('/me', authenticateJWT, usuarioController.atualizarMe);
router.put('/me/senha', authenticateJWT, usuarioController.alterarSenha);

// Rotas com parâmetros depois
router.post('/', authenticateJWT, isAdmin, usuarioController.criar);
router.get('/', authenticateJWT, isAdmin, usuarioController.listar);
router.get('/:id', authenticateJWT, isAdmin, usuarioController.buscarPorId);
router.put('/:id', authenticateJWT, isAdmin, usuarioController.atualizar);
router.delete('/:id', authenticateJWT, isAdmin, usuarioController.deletar);

export default router; 