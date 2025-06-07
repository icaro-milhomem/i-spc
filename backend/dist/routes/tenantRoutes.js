"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TenantController_1 = require("../controllers/TenantController");
const auth_1 = require("../middleware/auth");
const prismaClient_1 = require("../database/prismaClient");
const uploadLogo_1 = require("../middleware/uploadLogo");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateJWT, TenantController_1.TenantController.listar);
router.post('/', auth_1.authenticateJWT, TenantController_1.TenantController.criar);
router.put('/:id', auth_1.authenticateJWT, TenantController_1.TenantController.atualizar);
router.delete('/:id', auth_1.authenticateJWT, TenantController_1.TenantController.deletar);
router.post('/register', TenantController_1.TenantController.register);
router.get('/minha', auth_1.authenticateJWT, async (req, res) => {
    try {
        const usuario = req.user;
        if (!usuario || !usuario.tenant_id) {
            return res.status(401).json({ error: 'Usuário não autenticado corretamente.' });
        }
        const empresa = await prismaClient_1.prisma.tenant.findUnique({
            where: { id: usuario.tenant_id },
            select: { nome: true, cnpj: true }
        });
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa não encontrada.' });
        }
        res.json(empresa);
    }
    catch (error) {
        console.error('Erro ao buscar empresa:', error);
        res.status(500).json({ error: 'Erro ao buscar empresa.' });
    }
});
router.get('/cnpj/:cnpj', async (req, res) => {
    const { cnpj } = req.params;
    try {
        const empresa = await prismaClient_1.prisma.tenant.findUnique({
            where: { cnpj },
            select: { nome: true, cnpj: true }
        });
        if (!empresa) {
            return res.status(404).json({ error: 'Empresa não encontrada.' });
        }
        res.json(empresa);
    }
    catch (error) {
        console.error('Erro ao buscar empresa por CNPJ:', error);
        res.status(500).json({ error: 'Erro ao buscar empresa por CNPJ.' });
    }
});
router.post('/logo', auth_1.authenticateJWT, uploadLogo_1.uploadLogo.single('logo'), TenantController_1.TenantController.uploadLogo);
exports.default = router;
