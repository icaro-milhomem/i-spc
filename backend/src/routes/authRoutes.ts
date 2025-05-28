import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticateJWT, authController.me);

export default router; 