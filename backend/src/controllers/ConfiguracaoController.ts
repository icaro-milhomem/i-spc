import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class ConfiguracaoController {
    async criar(req: Request, res: Response) {
        try {
            const { chave, valor, descricao } = req.body;

            if (!chave || !valor) {
                throw new AppError('Chave e valor são obrigatórios', 400);
            }

            const configuracao = await prisma.configuracao.create({
                data: {
                    chave,
                    valor,
                    descricao
                }
            });

            return res.status(201).json(configuracao);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar configuração:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const configuracoes = await prisma.configuracao.findMany();

            return res.json(configuracoes);
        } catch (error) {
            console.error('Erro ao listar configurações:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async buscarPorChave(req: Request, res: Response) {
        try {
            const { chave } = req.params;

            const configuracao = await prisma.configuracao.findUnique({
                where: { chave }
            });

            if (!configuracao) {
                throw new AppError('Configuração não encontrada', 404);
            }

            return res.json(configuracao);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar configuração:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async atualizar(req: Request, res: Response) {
        try {
            const { chave } = req.params;
            const { valor, descricao } = req.body;

            if (!valor) {
                throw new AppError('Valor é obrigatório', 400);
            }

            const configuracao = await prisma.configuracao.findUnique({
                where: { chave }
            });

            if (!configuracao) {
                throw new AppError('Configuração não encontrada', 404);
            }

            const configuracaoAtualizada = await prisma.configuracao.update({
                where: { chave },
                data: {
                    valor,
                    descricao
                }
            });

            return res.json(configuracaoAtualizada);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar configuração:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async deletar(req: Request, res: Response) {
        try {
            const { chave } = req.params;

            const configuracao = await prisma.configuracao.findUnique({
                where: { chave }
            });

            if (!configuracao) {
                throw new AppError('Configuração não encontrada', 404);
            }

            await prisma.configuracao.delete({
                where: { chave }
            });

            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar configuração:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
} 