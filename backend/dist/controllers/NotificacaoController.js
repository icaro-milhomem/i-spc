"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacaoController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class NotificacaoController {
    async listar(req, res) {
        try {
            const notificacoes = await prismaClient_1.prisma.notificacao.findMany({
                orderBy: {
                    data: 'desc'
                },
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            cpf: true
                        }
                    }
                }
            });
            return res.json(notificacoes);
        }
        catch (error) {
            console.error('Erro ao listar notificações:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async criar(req, res) {
        try {
            const { cliente_id, tipo, mensagem } = req.body;
            if (!cliente_id || !tipo || !mensagem) {
                throw new AppError_1.AppError('Cliente, tipo e mensagem são obrigatórios', 400);
            }
            const notificacao = await prismaClient_1.prisma.notificacao.create({
                data: {
                    cliente_id: Number(cliente_id),
                    tipo,
                    mensagem,
                    status: 'pendente',
                    data: new Date()
                }
            });
            return res.status(201).json(notificacao);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar notificação:', error);
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
            const notificacao = await prismaClient_1.prisma.notificacao.findUnique({
                where: { id: Number(id) }
            });
            if (!notificacao) {
                throw new AppError_1.AppError('Notificação não encontrada', 404);
            }
            const notificacaoAtualizada = await prismaClient_1.prisma.notificacao.update({
                where: { id: Number(id) },
                data: { status }
            });
            return res.json(notificacaoAtualizada);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar status da notificação:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.NotificacaoController = NotificacaoController;
