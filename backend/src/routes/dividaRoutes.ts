import { Router } from 'express';
import { DividaController } from '../controllers/DividaController';
import { authenticateJWT } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();

router.post('/', authenticateJWT, DividaController.criar);
router.get('/cliente/:cliente_id', authenticateJWT, cacheMiddleware({ ttl: 5, keyPrefix: 'dividas:cliente:' }), DividaController.listar);
router.get('/consultar/:cpf_cnpj', authenticateJWT, cacheMiddleware({ ttl: 5, keyPrefix: 'dividas:consulta:' }), DividaController.consultarPorCpfCnpj);
router.put('/editar/:id', authenticateJWT, DividaController.editar);
router.delete('/remover/:id', authenticateJWT, DividaController.remover);
router.get('/:id', authenticateJWT, cacheMiddleware({ ttl: 5, keyPrefix: 'dividas:id:' }), DividaController.buscarPorId);
router.put('/:id', authenticateJWT, DividaController.editar);
router.patch('/:id/status', authenticateJWT, (req, res) => {
  const controller = new DividaController();
  return controller.atualizarStatus(req, res);
});

export default router;