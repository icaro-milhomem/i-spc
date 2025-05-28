"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClienteController_1 = require("../controllers/ClienteController");
const auth_1 = require("../middleware/auth");
const prismaClient_1 = require("../database/prismaClient");
const DividaController_1 = require("../controllers/DividaController");
const router = (0, express_1.Router)();
const clienteController = new ClienteController_1.ClienteController();
const dividaController = new DividaController_1.DividaController();
router.post('/', auth_1.authenticateJWT, clienteController.criar);
router.get('/:cpf', auth_1.authenticateJWT, clienteController.buscarPorCPF);
router.patch('/:cpf/status', auth_1.authenticateJWT, clienteController.atualizarStatus);
router.get('/', auth_1.authenticateJWT, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const [clientes, total] = await Promise.all([
        prismaClient_1.prisma.cliente.findMany({
            skip,
            take: limit,
        }),
        prismaClient_1.prisma.cliente.count(),
    ]);
    res.json({
        data: clientes,
        total,
        page,
        limit,
    });
});
router.get('/:cliente_id/dividas', auth_1.authenticateJWT, dividaController.buscarPorCliente);
exports.default = router;
