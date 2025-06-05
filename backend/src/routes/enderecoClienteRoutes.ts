import { Router } from 'express';
import enderecoClienteController from '../controllers/EnderecoClienteController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Adiciona um novo endereço para um cliente
router.post('/cliente/:cliente_id', authenticateJWT, enderecoClienteController.adicionarEndereco);

// Lista todos os endereços de um cliente
router.get('/cliente/:cliente_id', authenticateJWT, enderecoClienteController.listarEnderecos);

// Remove um endereço
router.delete('/:id', authenticateJWT, enderecoClienteController.removerEndereco);

export default router; 