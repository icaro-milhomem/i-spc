import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class DashboardController {
    async obterResumo(req: Request, res: Response) {
        try {
            const totalClientes = await prisma.cliente.count();
            const totalDividas = await prisma.divida.count();
            const dividasVencidas = await prisma.divida.count({
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
        } catch (error) {
            console.error('Erro ao obter resumo:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async obterDividasVencidas(req: Request, res: Response) {
        try {
            const dividas = await prisma.divida.findMany({
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
        } catch (error) {
            console.error('Erro ao obter dívidas vencidas:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async obterDividasPorStatus(req: Request, res: Response) {
        try {
            const dividasPorStatus = await prisma.divida.groupBy({
                by: ['status'],
                _count: true,
                _sum: {
                    valor: true
                }
            });

            return res.json(dividasPorStatus);
        } catch (error) {
            console.error('Erro ao obter dívidas por status:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async obterDividasPorMes(req: Request, res: Response) {
        try {
            const dividasPorMes = await prisma.divida.groupBy({
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
        } catch (error) {
            console.error('Erro ao obter dívidas por mês:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async obterStats(req: Request, res: Response) {
        try {
            const totalUsuarios = await prisma.usuario.count();
            const totalClientes = await prisma.cliente.count();
            const totalDividas = await prisma.divida.count();
            const totalConsultas = await prisma.consulta.count();
            const valorTotalDividas = await prisma.divida.aggregate({
                _sum: { valor: true }
            });

            return res.json({
                totalUsuarios,
                totalClientes,
                totalDividas,
                totalConsultas,
                valorTotalDividas: valorTotalDividas._sum.valor || 0
            });
        } catch (error) {
            console.error('Erro ao obter stats:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
} 