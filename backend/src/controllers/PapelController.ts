import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class PapelController {
    async criar(req: Request, res: Response) {
        try {
            const { nome, descricao, permissoes } = req.body;

            if (!nome) {
                throw new AppError('Nome é obrigatório', 400);
            }

            const papel = await prisma.papel.create({
                data: {
                    nome,
                    descricao,
                    permissoes: {
                        connect: permissoes?.map((id: number) => ({ id })) || []
                    }
                },
                include: {
                    permissoes: true
                }
            });

            return res.status(201).json(papel);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar papel:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const papeis = await prisma.papel.findMany({
                include: {
                    permissoes: true
                }
            });

            return res.json(papeis);
        } catch (error) {
            console.error('Erro ao listar papéis:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async buscarPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const papel = await prisma.papel.findUnique({
                where: { id: Number(id) },
                include: {
                    permissoes: true
                }
            });

            if (!papel) {
                throw new AppError('Papel não encontrado', 404);
            }

            return res.json(papel);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar papel:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { nome, descricao, permissoes } = req.body;

            if (!nome) {
                throw new AppError('Nome é obrigatório', 400);
            }

            const papel = await prisma.papel.findUnique({
                where: { id: Number(id) }
            });

            if (!papel) {
                throw new AppError('Papel não encontrado', 404);
            }

            const papelAtualizado = await prisma.papel.update({
                where: { id: Number(id) },
                data: {
                    nome,
                    descricao,
                    permissoes: {
                        set: permissoes?.map((id: number) => ({ id })) || []
                    }
                },
                include: {
                    permissoes: true
                }
            });

            return res.json(papelAtualizado);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar papel:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const papel = await prisma.papel.findUnique({
                where: { id: Number(id) }
            });

            if (!papel) {
                throw new AppError('Papel não encontrado', 404);
            }

            await prisma.papel.delete({
                where: { id: Number(id) }
            });

            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar papel:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
} 