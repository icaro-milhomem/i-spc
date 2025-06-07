import { Router } from 'express';
import { TenantController } from '../controllers/TenantController';
import { authenticateJWT } from '../middleware/auth';
import { prisma } from '../database/prismaClient';
import { uploadLogo } from '../middleware/uploadLogo';

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
      // Retorna dados nulos para superadmin ou usuários sem tenant
      return res.json({ nome: '', cnpj: '', logo: null });
    }
    const empresa = await prisma.tenant.findUnique({
      where: { id: usuario.tenant_id },
      select: { nome: true, cnpj: true, logo: true }
    });
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }
    // Monta a URL completa da logo
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const logo = empresa.logo
      ? empresa.logo.startsWith('http')
        ? empresa.logo
        : `${baseUrl}${empresa.logo}`
      : null;
    res.json({
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      logo
    });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa.' });
  }
});

router.get('/cnpj/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  try {
    const empresa = await prisma.tenant.findUnique({
      where: { cnpj },
      select: { nome: true, cnpj: true }
    });
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa por CNPJ:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa por CNPJ.' });
  }
});

router.post('/logo', authenticateJWT, uploadLogo.single('logo'), TenantController.uploadLogo);

export default router;