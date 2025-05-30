"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
const bcryptjs_1 = require("bcryptjs");
class UsuarioController {
    async criar(req, res) {
        try {
            console.log('REQ BODY:', req.body);
            const { nome, email, senha, perfil } = req.body;
            if (!nome || !email || !senha || !perfil) {
                throw new AppError_1.AppError('Nome, email, senha e perfil são obrigatórios', 400);
            }
            const usuarioExistente = await prismaClient_1.prisma.usuario.findUnique({
                where: { email }
            });
            if (usuarioExistente) {
                throw new AppError_1.AppError('Email já cadastrado', 400);
            }
            const senhaHash = await (0, bcryptjs_1.hash)(senha, 8);
            const papel = await prismaClient_1.prisma.papel.findUnique({
                where: { nome: perfil }
            });
            if (!papel) {
                throw new AppError_1.AppError('Papel não encontrado', 500);
            }
            const usuario = await prismaClient_1.prisma.usuario.create({
                data: {
                    nome,
                    email,
                    senha: senhaHash,
                    papeis: {
                        connect: [{ id: papel.id }]
                    }
                },
                include: {
                    papeis: {
                        include: {
                            permissoes: true
                        }
                    }
                }
            });
            return res.status(201).json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                ativo: usuario.ativo,
                papeis: usuario.papeis
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar usuário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async listar(req, res) {
        try {
            const usuarios = await prismaClient_1.prisma.usuario.findMany({
                where: {
                    OR: [
                        { role: null },
                        { role: { not: 'superadmin' } }
                    ]
                },
                include: {
                    papeis: {
                        include: {
                            permissoes: true
                        }
                    }
                }
            });
            return res.json(usuarios.map(usuario => ({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                ativo: usuario.ativo,
                papeis: usuario.papeis
            })));
        }
        catch (error) {
            console.error('Erro ao listar usuários:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = await prismaClient_1.prisma.usuario.findUnique({
                where: { id: Number(id) },
                include: {
                    papeis: {
                        include: {
                            permissoes: true
                        }
                    }
                }
            });
            if (!usuario) {
                throw new AppError_1.AppError('Usuário não encontrado', 404);
            }
            return res.json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                ativo: usuario.ativo,
                papeis: usuario.papeis
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, email, senha, papeis } = req.body;
            if (!nome || !email) {
                throw new AppError_1.AppError('Nome e email são obrigatórios', 400);
            }
            const usuario = await prismaClient_1.prisma.usuario.findUnique({
                where: { id: Number(id) }
            });
            if (!usuario) {
                throw new AppError_1.AppError('Usuário não encontrado', 404);
            }
            const usuarioExistente = await prismaClient_1.prisma.usuario.findUnique({
                where: { email }
            });
            if (usuarioExistente && usuarioExistente.id !== Number(id)) {
                throw new AppError_1.AppError('Email já cadastrado', 400);
            }
            const data = {
                nome,
                email,
                papeis: {
                    set: (papeis === null || papeis === void 0 ? void 0 : papeis.map((id) => ({ id }))) || []
                }
            };
            if (senha) {
                data.senha = await (0, bcryptjs_1.hash)(senha, 8);
            }
            const usuarioAtualizado = await prismaClient_1.prisma.usuario.update({
                where: { id: Number(id) },
                data,
                include: {
                    papeis: {
                        include: {
                            permissoes: true
                        }
                    }
                }
            });
            return res.json({
                id: usuarioAtualizado.id,
                nome: usuarioAtualizado.nome,
                email: usuarioAtualizado.email,
                perfil: usuarioAtualizado.perfil,
                ativo: usuarioAtualizado.ativo,
                papeis: usuarioAtualizado.papeis
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const usuario = await prismaClient_1.prisma.usuario.findUnique({
                where: { id: Number(id) }
            });
            if (!usuario) {
                throw new AppError_1.AppError('Usuário não encontrado', 404);
            }
            await prismaClient_1.prisma.usuario.delete({
                where: { id: Number(id) }
            });
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar usuário:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.UsuarioController = UsuarioController;
