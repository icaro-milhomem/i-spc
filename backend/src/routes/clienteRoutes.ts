import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { DividaController } from '../controllers/DividaController';
import { prisma } from '../database/prismaClient';
import { authenticateJWT } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const clienteController = new ClienteController();
const dividaController = new DividaController();

// Rotas de cliente
router.get('/', authenticateJWT, cacheMiddleware({ ttl: 60, keyPrefix: 'clientes:lista:' }), (req, res) => clienteController.listar(req, res));
router.post('/', authenticateJWT, clienteController.criar);
router.get('/consulta', authenticateJWT, cacheMiddleware({ ttl: 60, keyPrefix: 'clientes:consulta:' }), clienteController.consultarPorCpfOuNome);
router.get('/:id', authenticateJWT, cacheMiddleware({ ttl: 60, keyPrefix: 'clientes:id:' }), clienteController.buscarPorId);
router.put('/:id', authenticateJWT, clienteController.atualizar);
router.get('/cpf/:cpf', authenticateJWT, cacheMiddleware({ ttl: 60, keyPrefix: 'clientes:cpf:' }), clienteController.buscarPorCPF);
router.patch('/cpf/:cpf/status', authenticateJWT, clienteController.atualizarStatus);

// Rotas de dívidas
router.get('/:cliente_id/dividas', authenticateJWT, cacheMiddleware({ ttl: 5, keyPrefix: 'clientes:dividas:' }), dividaController.buscarPorCliente);

export default router;