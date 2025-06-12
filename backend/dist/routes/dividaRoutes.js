"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DividaController_1 = require("../controllers/DividaController");
const auth_1 = require("../middleware/auth");
const cacheMiddleware_1 = require("../middleware/cacheMiddleware");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticateJWT, DividaController_1.DividaController.criar);
router.get('/cliente/:cliente_id', auth_1.authenticateJWT, (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 5, keyPrefix: 'dividas:cliente:' }), DividaController_1.DividaController.listar);
router.get('/consultar/:cpf_cnpj', auth_1.authenticateJWT, (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 5, keyPrefix: 'dividas:consulta:' }), DividaController_1.DividaController.consultarPorCpfCnpj);
router.put('/editar/:id', auth_1.authenticateJWT, DividaController_1.DividaController.editar);
router.delete('/remover/:id', auth_1.authenticateJWT, DividaController_1.DividaController.remover);
router.get('/:id', auth_1.authenticateJWT, (0, cacheMiddleware_1.cacheMiddleware)({ ttl: 5, keyPrefix: 'dividas:id:' }), DividaController_1.DividaController.buscarPorId);
router.put('/:id', auth_1.authenticateJWT, DividaController_1.DividaController.editar);
router.patch('/:id/status', auth_1.authenticateJWT, (req, res) => {
    const controller = new DividaController_1.DividaController();
    return controller.atualizarStatus(req, res);
});
exports.default = router;
