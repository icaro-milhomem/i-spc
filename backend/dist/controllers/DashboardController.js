"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const prismaClient_1 = require("../database/prismaClient");
class DashboardController {
    async obterResumo(req, res) {
        try {
            const totalClientes = await prismaClient_1.prisma.cliente.count();
            const totalDividas = await prismaClient_1.prisma.divida.count();
            const dividasVencidas = await prismaClient_1.prisma.divida.count({
                where: {
                    data_vencimento: {
                        lt: new Date()
                    },
                    status: 'pendente'
                }
            });
            return res.json({
                totalClientes,
                totalDividas,
                dividasVencidas
            });
        }
        catch (error) {
            console.error('Erro ao obter resumo:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async obterDividasVencidas(req, res) {
        try {
            const dividas = await prismaClient_1.prisma.divida.findMany({
                where: {
                    data_vencimento: {
                        lt: new Date()
                    },
                    status: 'pendente'
                },
                include: {
                    cliente: true
                },
                orderBy: {
                    data_vencimento: 'asc'
                }
            });
            return res.json(dividas);
        }
        catch (error) {
            console.error('Erro ao obter dívidas vencidas:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async obterDividasPorStatus(req, res) {
        try {
            const dividasPorStatus = await prismaClient_1.prisma.divida.groupBy({
                by: ['status'],
                _count: true,
                _sum: {
                    valor: true
                }
            });
            return res.json(dividasPorStatus);
        }
        catch (error) {
            console.error('Erro ao obter dívidas por status:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async obterDividasPorMes(req, res) {
        try {
            const dividasPorMes = await prismaClient_1.prisma.divida.groupBy({
                by: ['data_vencimento'],
                _count: true,
                _sum: {
                    valor: true
                },
                orderBy: {
                    data_vencimento: 'asc'
                }
            });
            return res.json(dividasPorMes);
        }
        catch (error) {
            console.error('Erro ao obter dívidas por mês:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async obterStats(req, res) {
        try {
            const totalUsuarios = await prismaClient_1.prisma.usuario.count();
            const totalClientes = await prismaClient_1.prisma.cliente.count();
            const totalDividas = await prismaClient_1.prisma.divida.count();
            const totalConsultas = await prismaClient_1.prisma.consulta.count();
            const valorTotalDividas = await prismaClient_1.prisma.divida.aggregate({
                _sum: { valor: true }
            });
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
