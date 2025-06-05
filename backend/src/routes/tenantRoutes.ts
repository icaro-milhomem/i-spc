import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';
import { authenticateJWT } from '../middleware/auth';
import { prisma } from '../database/prismaClient';

const router = Router();

router.get('/', authenticateJWT, TenantController.listar);
router.post('/', authenticateJWT, TenantController.criar);
router.put('/:id', authenticateJWT, TenantController.atualizar);
router.delete('/:id', authenticateJWT, TenantController.deletar);
router.post('/register', TenantController.register);

router.get('/minha', authenticateJWT, async (req, res) => {
  try {
    const usuario = req.user;
    if (!usuario || !usuario.tenant_id) {
      return res.status(401).json({ error: 'Usuário não autenticado corretamente.' });
    }
    const empresa = await prisma.tenant.findUnique({
      where: { id: usuario.tenant_id },
      select: { nome: true, cnpj: true }
    });
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa.' });
  }
});

export default router;