import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { DividaController } from '../controllers/DividaController';
import { prisma } from '../database/prismaClient';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const clienteController = new ClienteController();
const dividaController = new DividaController();

// Rotas de cliente
router.get('/', authenticateJWT, (req, res) => clienteController.listar(req, res));
router.post('/', authenticateJWT, clienteController.criar);
router.get('/consulta', authenticateJWT, clienteController.consultarPorCpfOuNome);
router.get('/:id', authenticateJWT, clienteController.buscarPorId);
router.put('/:id', authenticateJWT, clienteController.atualizar);
router.get('/cpf/:cpf', authenticateJWT, clienteController.buscarPorCPF);
router.patch('/cpf/:cpf/status', authenticateJWT, clienteController.atualizarStatus);

// Rotas de dívidas
router.get('/:cliente_id/dividas', authenticateJWT, dividaController.buscarPorCliente);

export default router; 