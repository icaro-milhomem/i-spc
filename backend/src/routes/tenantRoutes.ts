import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, TenantController.listar);
router.post('/', authenticateJWT, TenantController.criar);
router.put('/:id', authenticateJWT, TenantController.atualizar);

export default router; 