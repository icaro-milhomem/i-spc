import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { DividaController } from '../controllers/DividaController';
import { prisma } from '../database/prismaClient';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const clienteController = new ClienteController();
const dividaController = new DividaController();

router.post('/', authenticateJWT, clienteController.criar);
router.get('/consulta', authenticateJWT, clienteController.consultarPorCpfOuNome);
router.get('/:cpf', authenticateJWT, clienteController.buscarPorCPF);
router.patch('/:cpf/status', authenticateJWT, clienteController.atualizarStatus);
router.put('/:id', authenticateJWT, clienteController.atualizar);

router.get('/', authenticateJWT, (req, res) => clienteController.listar(req, res));

router.get('/:cliente_id/dividas', authenticateJWT, dividaController.buscarPorCliente);

export default router; 