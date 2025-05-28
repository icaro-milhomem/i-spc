import { Router } from 'express';
import { PapelController } from '../controllers/PapelController';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();
const papelController = new PapelController();

router.post('/', authenticateJWT, isAdmin, papelController.criar);
router.get('/', authenticateJWT, papelController.listar);
router.get('/:id', authenticateJWT, papelController.buscarPorId);
router.put('/:id', authenticateJWT, isAdmin, papelController.atualizar);
router.delete('/:id', authenticateJWT, isAdmin, papelController.deletar);

export default router; 