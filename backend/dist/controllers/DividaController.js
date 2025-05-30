"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DividaController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class DividaController {
    async atualizarStatusCliente(clienteId) {
        const dividaPendente = await prismaClient_1.prisma.divida.findFirst({
            where: {
                cliente_id: clienteId,
                status: 'pendente'
            }
        });
        await prismaClient_1.prisma.cliente.update({
            where: { id: clienteId },
            data: { status: dividaPendente ? 'inativo' : 'ativo' }
        });
    }
    async criar(req, res) {
        try {
            const { cliente_id, valor, data_vencimento, descricao } = req.body;
            if (!cliente_id || !valor || !data_vencimento) {
                throw new AppError_1.AppError('Cliente, valor e data de vencimento são obrigatórios', 400);
            }
            const cliente = await prismaClient_1.prisma.cliente.findUnique({
                where: { id: Number(cliente_id) }
            });
            if (!cliente) {
                throw new AppError_1.AppError('Cliente não encontrado', 404);
            }
            const divida = await prismaClient_1.prisma.divida.create({
                data: {
                    cliente_id: Number(cliente_id),
                    valor: Number(valor),
                    data_vencimento: new Date(data_vencimento),
                    descricao,
                    status: 'pendente'
                }
            });
            await this.atualizarStatusCliente(Number(cliente_id));
            return res.status(201).json(divida);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar dívida:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorCliente(req, res) {
        try {
            console.log('Parâmetros recebidos:', req.params, req.query);
            const { cliente_id } = req.params;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const cliente = await prismaClient_1.prisma.cliente.findUnique({
                where: { id: Number(cliente_id) }
            });
            if (!cliente) {
                throw new AppError_1.AppError('Cliente não encontrado', 404);
            }
            const dividas = await prismaClient_1.prisma.divida.findMany({
                where: { cliente_id: Number(cliente_id) },
                orderBy: { data_vencimento: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            });
            const total = await prismaClient_1.prisma.divida.count({
                where: { cliente_id: Number(cliente_id) }
            });
            return res.json({
                data: dividas,
                total,
                page,
                limit
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar dívidas do cliente:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                throw new AppError_1.AppError('Status é obrigatório', 400);
            }
            const divida = await prismaClient_1.prisma.divida.findUnique({
                where: { id: Number(id) }
            });
            if (!divida) {
                throw new AppError_1.AppError('Dívida não encontrada', 404);
            }
            const dividaAtualizada = await prismaClient_1.prisma.divida.update({
                where: { id: Number(id) },
                data: { status }
            });
            await this.atualizarStatusCliente(divida.cliente_id);
            return res.json(dividaAtualizada);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar status da dívida:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { cliente_id, valor, data_vencimento, status, descricao, ativo } = req.body;
            const divida = await prismaClient_1.prisma.divida.findUnique({
                where: { id: Number(id) }
            });
            if (!divida) {
                throw new AppError_1.AppError('Dívida não encontrada', 404);
            }
            const dividaAtualizada = await prismaClient_1.prisma.divida.update({
                where: { id: Number(id) },
                data: {
                    cliente_id: Number(cliente_id),
                    valor: Number(valor),
                    data_vencimento: new Date(data_vencimento),
                    status,
                    descricao,
                }
            });
            await this.atualizarStatusCliente(Number(cliente_id));
            return res.json(dividaAtualizada);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar dívida:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const divida = await prismaClient_1.prisma.divida.findUnique({
                where: { id: Number(id) }
            });
            if (!divida) {
                throw new AppError_1.AppError('Dívida não encontrada', 404);
            }
            return res.json(divida);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar dívida:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const divida = await prismaClient_1.prisma.divida.findUnique({ where: { id: Number(id) } });
            if (!divida) {
                throw new AppError_1.AppError('Dívida não encontrada', 404);
            }
            await prismaClient_1.prisma.divida.delete({ where: { id: Number(id) } });
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar dívida:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.DividaController = DividaController;
