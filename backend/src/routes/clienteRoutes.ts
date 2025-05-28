import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { authenticateJWT } from '../middleware/auth';
import { prisma } from '../database/prismaClient';
import { DividaController } from '../controllers/DividaController';

const router = Router();
const clienteController = new ClienteController();
const dividaController = new DividaController();

router.post('/', authenticateJWT, clienteController.criar);
router.get('/:cpf', authenticateJWT, clienteController.buscarPorCPF);
router.patch('/:cpf/status', authenticateJWT, clienteController.atualizarStatus);

router.get('/', authenticateJWT, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      skip,
      take: limit,
    }),
    prisma.cliente.count(),
  ]);

  res.json({
    data: clientes,
    total,
    page,
    limit,
  });
});

router.get('/:cliente_id/dividas', authenticateJWT, dividaController.buscarPorCliente);

export default router; 