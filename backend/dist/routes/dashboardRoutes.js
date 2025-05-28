"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DashboardController_1 = require("../controllers/DashboardController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const dashboardController = new DashboardController_1.DashboardController();
router.get('/resumo', auth_1.authenticateJWT, dashboardController.obterResumo);
router.get('/dividas-vencidas', auth_1.authenticateJWT, dashboardController.obterDividasVencidas);
router.get('/dividas-por-status', auth_1.authenticateJWT, dashboardController.obterDividasPorStatus);
router.get('/dividas-por-mes', auth_1.authenticateJWT, dashboardController.obterDividasPorMes);
router.get('/stats', auth_1.authenticateJWT, async (req, res) => {
    res.json({
        totalUsuarios: 10,
        totalClientes: 20,
        totalDividas: 5
    });
});
exports.default = router;
