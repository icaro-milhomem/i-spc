import { Router } from 'express';
import { BackupController } from '../controllers/BackupController';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();
const backupController = new BackupController();

router.post('/', authenticateJWT, isAdmin, backupController.criar);
router.get('/', authenticateJWT, isAdmin, backupController.listar);
router.get('/:id', authenticateJWT, isAdmin, backupController.buscarPorId);
router.delete('/:id', authenticateJWT, isAdmin, backupController.deletar);

export default router; 