"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissaoController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class PermissaoController {
    async criar(req, res) {
        try {
            const { codigo, descricao } = req.body;
            if (!codigo) {
                throw new AppError_1.AppError('Código é obrigatório', 400);
            }
            const permissao = await prismaClient_1.prisma.permissao.create({
                data: {
                    codigo,
                    descricao
                }
            });
            return res.status(201).json(permissao);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar permissão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async listar(req, res) {
        try {
            const permissoes = await prismaClient_1.prisma.permissao.findMany();
            return res.json(permissoes);
        }
        catch (error) {
            console.error('Erro ao listar permissões:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const permissao = await prismaClient_1.prisma.permissao.findUnique({
                where: { id: Number(id) }
            });
            if (!permissao) {
                throw new AppError_1.AppError('Permissão não encontrada', 404);
            }
            return res.json(permissao);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar permissão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { codigo, descricao } = req.body;
            if (!codigo) {
                throw new AppError_1.AppError('Código é obrigatório', 400);
            }
            const permissao = await prismaClient_1.prisma.permissao.findUnique({
                where: { id: Number(id) }
            });
            if (!permissao) {
                throw new AppError_1.AppError('Permissão não encontrada', 404);
            }
            const permissaoAtualizada = await prismaClient_1.prisma.permissao.update({
                where: { id: Number(id) },
                data: {
                    codigo,
                    descricao
                }
            });
            return res.json(permissaoAtualizada);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar permissão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const permissao = await prismaClient_1.prisma.permissao.findUnique({
                where: { id: Number(id) }
            });
            if (!permissao) {
                throw new AppError_1.AppError('Permissão não encontrada', 404);
            }
            await prismaClient_1.prisma.permissao.delete({
                where: { id: Number(id) }
            });
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar permissão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.PermissaoController = PermissaoController;
