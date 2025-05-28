"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguracaoController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class ConfiguracaoController {
    async criar(req, res) {
        try {
            const { chave, valor, descricao } = req.body;
            if (!chave || !valor) {
                throw new AppError_1.AppError('Chave e valor são obrigatórios', 400);
            }
            const configuracao = await prismaClient_1.prisma.configuracao.create({
                data: {
                    chave,
                    valor,
                    descricao
                }
            });
            return res.status(201).json(configuracao);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar configuração:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async listar(req, res) {
        try {
            const configuracoes = await prismaClient_1.prisma.configuracao.findMany();
            return res.json(configuracoes);
        }
        catch (error) {
            console.error('Erro ao listar configurações:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorChave(req, res) {
        try {
            const { chave } = req.params;
            const configuracao = await prismaClient_1.prisma.configuracao.findUnique({
                where: { chave }
            });
            if (!configuracao) {
                throw new AppError_1.AppError('Configuração não encontrada', 404);
            }
            return res.json(configuracao);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar configuração:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizar(req, res) {
        try {
            const { chave } = req.params;
            const { valor, descricao } = req.body;
            if (!valor) {
                throw new AppError_1.AppError('Valor é obrigatório', 400);
            }
            const configuracao = await prismaClient_1.prisma.configuracao.findUnique({
                where: { chave }
            });
            if (!configuracao) {
                throw new AppError_1.AppError('Configuração não encontrada', 404);
            }
            const configuracaoAtualizada = await prismaClient_1.prisma.configuracao.update({
                where: { chave },
                data: {
                    valor,
                    descricao
                }
            });
            return res.json(configuracaoAtualizada);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar configuração:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async deletar(req, res) {
        try {
            const { chave } = req.params;
            const configuracao = await prismaClient_1.prisma.configuracao.findUnique({
                where: { chave }
            });
            if (!configuracao) {
                throw new AppError_1.AppError('Configuração não encontrada', 404);
            }
            await prismaClient_1.prisma.configuracao.delete({
                where: { chave }
            });
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar configuração:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.ConfiguracaoController = ConfiguracaoController;
