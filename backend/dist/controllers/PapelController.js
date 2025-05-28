"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PapelController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class PapelController {
    async criar(req, res) {
        try {
            const { nome, descricao, permissoes } = req.body;
            if (!nome) {
                throw new AppError_1.AppError('Nome é obrigatório', 400);
            }
            const papel = await prismaClient_1.prisma.papel.create({
                data: {
                    nome,
                    descricao,
                    permissoes: {
                        connect: (permissoes === null || permissoes === void 0 ? void 0 : permissoes.map((id) => ({ id }))) || []
                    }
                },
                include: {
                    permissoes: true
                }
            });
            return res.status(201).json(papel);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar papel:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async listar(req, res) {
        try {
            const papeis = await prismaClient_1.prisma.papel.findMany({
                include: {
                    permissoes: true
                }
            });
            return res.json(papeis);
        }
        catch (error) {
            console.error('Erro ao listar papéis:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const papel = await prismaClient_1.prisma.papel.findUnique({
                where: { id: Number(id) },
                include: {
                    permissoes: true
                }
            });
            if (!papel) {
                throw new AppError_1.AppError('Papel não encontrado', 404);
            }
            return res.json(papel);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar papel:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao, permissoes } = req.body;
            if (!nome) {
                throw new AppError_1.AppError('Nome é obrigatório', 400);
            }
            const papel = await prismaClient_1.prisma.papel.findUnique({
                where: { id: Number(id) }
            });
            if (!papel) {
                throw new AppError_1.AppError('Papel não encontrado', 404);
            }
            const papelAtualizado = await prismaClient_1.prisma.papel.update({
                where: { id: Number(id) },
                data: {
                    nome,
                    descricao,
                    permissoes: {
                        set: (permissoes === null || permissoes === void 0 ? void 0 : permissoes.map((id) => ({ id }))) || []
                    }
                },
                include: {
                    permissoes: true
                }
            });
            return res.json(papelAtualizado);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar papel:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const papel = await prismaClient_1.prisma.papel.findUnique({
                where: { id: Number(id) }
            });
            if (!papel) {
                throw new AppError_1.AppError('Papel não encontrado', 404);
            }
            await prismaClient_1.prisma.papel.delete({
                where: { id: Number(id) }
            });
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar papel:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.PapelController = PapelController;
