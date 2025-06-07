import { Router } from 'express';
import { SpeedioController } from '../controllers/SpeedioController';

const router = Router();

router.get('/cnpj/:cnpj', SpeedioController.buscarCnpj);

export default router;
