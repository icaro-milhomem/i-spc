"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class BackupController {
    async criar(req, res) {
        var _a;
        try {
            const backup = await prismaClient_1.prisma.backup.create({
                data: {
                    data: new Date(),
                    status: 'pendente',
                    usuario_id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 0
                }
            });
            return res.status(201).json(backup);
        }
        catch (error) {
            console.error('Erro ao criar backup:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async listar(req, res) {
        try {
            const backups = await prismaClient_1.prisma.backup.findMany({
                orderBy: {
                    data: 'desc'
                }
            });
            return res.json(backups);
        }
        catch (error) {
            console.error('Erro ao listar backups:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const backup = await prismaClient_1.prisma.backup.findUnique({
                where: { id: Number(id) }
            });
            if (!backup) {
                throw new AppError_1.AppError('Backup não encontrado', 404);
            }
            return res.json(backup);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar backup:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const backup = await prismaClient_1.prisma.backup.findUnique({
                where: { id: Number(id) }
            });
            if (!backup) {
                throw new AppError_1.AppError('Backup não encontrado', 404);
            }
            await prismaClient_1.prisma.backup.delete({
                where: { id: Number(id) }
            });
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar backup:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.BackupController = BackupController;
