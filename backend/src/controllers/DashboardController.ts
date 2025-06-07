import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';

export class DashboardController {
    async obterResumo(req: Request, res: Response) {
        try {
            const usuarioLogado = req.user;
            let clienteWhere: any = {};
            let dividaWhere: any = {};

            // Se for admin (mas não superadmin), filtra pelos dados do tenant
            if (usuarioLogado?.perfil === 'admin' && usuarioLogado?.role !== 'superadmin') {
                clienteWhere = { tenant_id: usuarioLogado.tenant_id };
                dividaWhere = { tenant_id: usuarioLogado.tenant_id };
            }

            const totalClientes = await prisma.cliente.count({ where: clienteWhere });
            const totalDividas = await prisma.divida.count({ where: dividaWhere });
            return res.json({
                totalClientes,
                totalDividas
            });
        } catch (error) {
            console.error('Erro ao obter resumo:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async obterStats(req: Request, res: Response) {
        try {
            const usuarioLogado = req.user;
            let usuarioWhere: any = {};
            let clienteWhere: any = {};
            let dividaWhere: any = {};
            let consultaWhere: any = {};

            console.log('Usuário logado:', usuarioLogado);

            if (usuarioLogado?.perfil === 'admin' && usuarioLogado?.role !== 'superadmin') {
                usuarioWhere = { tenant_id: usuarioLogado.tenant_id };
                clienteWhere = { tenant_id: usuarioLogado.tenant_id };
                dividaWhere = { tenant_id: usuarioLogado.tenant_id };
                // Não filtra consultaWhere pois Consulta não tem tenant_id
            }

            const totalUsuarios = await prisma.usuario.count({ where: usuarioWhere });
            console.log('totalUsuarios:', totalUsuarios);
            const totalClientes = await prisma.cliente.count({ where: clienteWhere });
            console.log('totalClientes:', totalClientes);
            const totalDividas = await prisma.divida.count({ where: dividaWhere });
            console.log('totalDividas:', totalDividas);
            const totalConsultas = await prisma.consulta.count(); // Consulta é global
            console.log('totalConsultas:', totalConsultas);
            const valorTotalDividas = await prisma.divida.aggregate({
                _sum: { valor: true },
                where: dividaWhere
            });
            console.log('valorTotalDividas:', valorTotalDividas);

            // Adiciona a contagem de empresas (tenants)
            const totalEmpresas = await prisma.tenant.count();
            console.log('totalEmpresas:', totalEmpresas);

            return res.json({
                totalUsuarios,
                totalClientes,
                totalDividas,
                totalConsultas,
                valorTotalDividas: valorTotalDividas._sum.valor || 0,
                totalEmpresas
            });
        } catch (error) {
            console.error('Erro ao obter stats:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
} 