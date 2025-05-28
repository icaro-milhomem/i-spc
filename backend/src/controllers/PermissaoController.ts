import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class PermissaoController {
    async criar(req: Request, res: Response) {
        try {
            const { codigo, descricao } = req.body;

            if (!codigo) {
                throw new AppError('Código é obrigatório', 400);
            }

            const permissao = await prisma.permissao.create({
                data: {
                    codigo,
                    descricao
                }
            });

            return res.status(201).json(permissao);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar permissão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const permissoes = await prisma.permissao.findMany();

            return res.json(permissoes);
        } catch (error) {
            console.error('Erro ao listar permissões:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async buscarPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const permissao = await prisma.permissao.findUnique({
                where: { id: Number(id) }
            });

            if (!permissao) {
                throw new AppError('Permissão não encontrada', 404);
            }

            return res.json(permissao);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar permissão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { codigo, descricao } = req.body;

            if (!codigo) {
                throw new AppError('Código é obrigatório', 400);
            }

            const permissao = await prisma.permissao.findUnique({
                where: { id: Number(id) }
            });

            if (!permissao) {
                throw new AppError('Permissão não encontrada', 404);
            }

            const permissaoAtualizada = await prisma.permissao.update({
                where: { id: Number(id) },
                data: {
                    codigo,
                    descricao
                }
            });

            return res.json(permissaoAtualizada);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar permissão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const permissao = await prisma.permissao.findUnique({
                where: { id: Number(id) }
            });

            if (!permissao) {
                throw new AppError('Permissão não encontrada', 404);
            }

            await prisma.permissao.delete({
                where: { id: Number(id) }
            });

            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar permissão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
} 