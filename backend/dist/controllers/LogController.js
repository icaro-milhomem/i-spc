"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class LogController {
    async listar(req, res) {
        try {
            const logs = await prismaClient_1.prisma.log.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                }
            });
            return res.json(logs);
        }
        catch (error) {
            console.error('Erro ao listar logs:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const log = await prismaClient_1.prisma.log.findUnique({
                where: { id: Number(id) },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                }
            });
            if (!log) {
                throw new AppError_1.AppError('Log não encontrado', 404);
            }
            return res.json(log);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar log:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const log = await prismaClient_1.prisma.log.findUnique({
                where: { id: Number(id) }
            });
            if (!log) {
                throw new AppError_1.AppError('Log não encontrado', 404);
            }
            await prismaClient_1.prisma.log.delete({
                where: { id: Number(id) }
            });
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar log:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.LogController = LogController;
