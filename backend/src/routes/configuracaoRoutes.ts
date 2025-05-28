import { Router } from 'express';
import { ConfiguracaoController } from '../controllers/ConfiguracaoController';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();
const configuracaoController = new ConfiguracaoController();

router.post('/', authenticateJWT, isAdmin, configuracaoController.criar);
router.get('/', authenticateJWT, configuracaoController.listar);
router.get('/:chave', authenticateJWT, configuracaoController.buscarPorChave);
router.put('/:chave', authenticateJWT, isAdmin, configuracaoController.atualizar);
router.delete('/:chave', authenticateJWT, isAdmin, configuracaoController.deletar);

export default router; 