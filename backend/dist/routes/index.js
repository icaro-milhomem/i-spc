"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ConsultaController_1 = require("../controllers/ConsultaController");
const auth_1 = require("../middleware/auth");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const backupRoutes_1 = __importDefault(require("./backupRoutes"));
const clienteRoutes_1 = __importDefault(require("./clienteRoutes"));
const configuracaoRoutes_1 = __importDefault(require("./configuracaoRoutes"));
const dashboardRoutes_1 = __importDefault(require("./dashboardRoutes"));
const dividaRoutes_1 = __importDefault(require("./dividaRoutes"));
const logRoutes_1 = __importDefault(require("./logRoutes"));
const notificacaoRoutes_1 = __importDefault(require("./notificacaoRoutes"));
const papelRoutes_1 = __importDefault(require("./papelRoutes"));
const permissaoRoutes_1 = __importDefault(require("./permissaoRoutes"));
const relatorioRoutes_1 = __importDefault(require("./relatorioRoutes"));
const tenantRoutes_1 = __importDefault(require("./tenantRoutes"));
const usuarioRoutes_1 = __importDefault(require("./usuarioRoutes"));
const enderecoClienteRoutes_1 = __importDefault(require("./enderecoClienteRoutes"));
const speedioRoutes_1 = __importDefault(require("./speedioRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/usuarios', usuarioRoutes_1.default);
router.use('/clientes', clienteRoutes_1.default);
router.use('/dividas', dividaRoutes_1.default);
router.use('/notificacoes', notificacaoRoutes_1.default);
router.use('/papeis', papelRoutes_1.default);
router.use('/permissoes', permissaoRoutes_1.default);
router.use('/configuracoes', configuracaoRoutes_1.default);
router.use('/backups', backupRoutes_1.default);
router.use('/logs', logRoutes_1.default);
router.use('/dashboard', dashboardRoutes_1.default);
router.use('/tenants', tenantRoutes_1.default);
router.use('/enderecos', enderecoClienteRoutes_1.default);
router.get('/consulta/:cpf', auth_1.authenticateJWT, ConsultaController_1.ConsultaController.consultarCPF);
router.get('/consulta/:cpf/historico', auth_1.authenticateJWT, ConsultaController_1.ConsultaController.buscarHistorico);
router.post('/consultas/registrar', auth_1.authenticateJWT, ConsultaController_1.ConsultaController.registrar);
router.use('/speedio', speedioRoutes_1.default);
router.use('/relatorios', relatorioRoutes_1.default);
exports.default = router;
