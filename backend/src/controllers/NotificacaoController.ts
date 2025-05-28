import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class NotificacaoController {
    async listar(req: Request, res: Response) {
        try {
            const notificacoes = await prisma.notificacao.findMany({
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
        } catch (error) {
            console.error('Erro ao listar notificações:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async criar(req: Request, res: Response) {
        try {
            const { cliente_id, tipo, mensagem } = req.body;

            if (!cliente_id || !tipo || !mensagem) {
                throw new AppError('Cliente, tipo e mensagem são obrigatórios', 400);
            }

            const notificacao = await prisma.notificacao.create({
                data: {
                    cliente_id: Number(cliente_id),
                    tipo,
                    mensagem,
                    status: 'pendente',
                    data: new Date()
                }
            });

            return res.status(201).json(notificacao);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar notificação:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async atualizarStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                throw new AppError('Status é obrigatório', 400);
            }

            const notificacao = await prisma.notificacao.findUnique({
                where: { id: Number(id) }
            });

            if (!notificacao) {
                throw new AppError('Notificação não encontrada', 404);
            }

            const notificacaoAtualizada = await prisma.notificacao.update({
                where: { id: Number(id) },
                data: { status }
            });

            return res.json(notificacaoAtualizada);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar status da notificação:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
} 