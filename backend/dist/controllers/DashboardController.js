"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const prismaClient_1 = require("../database/prismaClient");
class DashboardController {
    async obterResumo(req, res) {
        try {
            const usuarioLogado = req.user;
            let clienteWhere = {};
            let dividaWhere = {};
            if ((usuarioLogado === null || usuarioLogado === void 0 ? void 0 : usuarioLogado.perfil) === 'admin' && (usuarioLogado === null || usuarioLogado === void 0 ? void 0 : usuarioLogado.role) !== 'superadmin') {
                clienteWhere = { tenant_id: usuarioLogado.tenant_id };
                dividaWhere = { tenant_id: usuarioLogado.tenant_id };
            }
            const totalClientes = await prismaClient_1.prisma.cliente.count({ where: clienteWhere });
            const totalDividas = await prismaClient_1.prisma.divida.count({ where: dividaWhere });
            return res.json({
                totalClientes,
                totalDividas
            });
        }
        catch (error) {
            console.error('Erro ao obter resumo:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async obterStats(req, res) {
        try {
            const usuarioLogado = req.user;
            let usuarioWhere = {};
            let clienteWhere = {};
            let dividaWhere = {};
            let consultaWhere = {};
            console.log('Usuário logado:', usuarioLogado);
            if ((usuarioLogado === null || usuarioLogado === void 0 ? void 0 : usuarioLogado.perfil) === 'admin' && (usuarioLogado === null || usuarioLogado === void 0 ? void 0 : usuarioLogado.role) !== 'superadmin') {
                usuarioWhere = { tenant_id: usuarioLogado.tenant_id };
                clienteWhere = { tenant_id: usuarioLogado.tenant_id };
                dividaWhere = { tenant_id: usuarioLogado.tenant_id };
            }
            const totalUsuarios = await prismaClient_1.prisma.usuario.count({ where: usuarioWhere });
            console.log('totalUsuarios:', totalUsuarios);
            const totalClientes = await prismaClient_1.prisma.cliente.count({ where: clienteWhere });
            console.log('totalClientes:', totalClientes);
            const totalDividas = await prismaClient_1.prisma.divida.count({ where: dividaWhere });
            console.log('totalDividas:', totalDividas);
            const totalConsultas = await prismaClient_1.prisma.consulta.count();
            console.log('totalConsultas:', totalConsultas);
            const valorTotalDividas = await prismaClient_1.prisma.divida.aggregate({
                _sum: { valor: true },
                where: dividaWhere
            });
            console.log('valorTotalDividas:', valorTotalDividas);
            return res.json({
                totalUsuarios,
                totalClientes,
                totalDividas,
                totalConsultas,
                valorTotalDividas: valorTotalDividas._sum.valor || 0
            });
        }
        catch (error) {
            console.error('Erro ao obter stats:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.DashboardController = DashboardController;
