import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class BackupController {
    async criar(req: Request, res: Response) {
        try {
            const backup = await prisma.backup.create({
                data: {
                    data: new Date(),
                    status: 'pendente',
                    usuario_id: req.user?.id || 0
                }
            });

            return res.status(201).json(backup);
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const backups = await prisma.backup.findMany({
                orderBy: {
                    data: 'desc'
                }
            });

            return res.json(backups);
        } catch (error) {
            console.error('Erro ao listar backups:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async buscarPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const backup = await prisma.backup.findUnique({
                where: { id: Number(id) }
            });

            if (!backup) {
                throw new AppError('Backup não encontrado', 404);
            }

            return res.json(backup);
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar backup:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const backup = await prisma.backup.findUnique({
                where: { id: Number(id) }
            });

            if (!backup) {
                throw new AppError('Backup não encontrado', 404);
            }

            await prisma.backup.delete({
                where: { id: Number(id) }
            });

            return res.status(204).send();
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar backup:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
} 