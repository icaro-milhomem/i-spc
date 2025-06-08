"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioController = void 0;
const bcryptjs_1 = require("bcryptjs");
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
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
            if (!req.user || !req.user.id) {
                throw new AppError_1.AppError('Usuário autenticado não encontrado', 401);
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
                    perfil,
                    criado_por_id: req.user.id,
                    tenant_id: req.user.tenant_id,
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
            const usuarioLogado = req.user;
            let where = {
                OR: [
                    { role: null },
                    { role: { not: 'superadmin' } }
                ]
            };
            if ((usuarioLogado === null || usuarioLogado === void 0 ? void 0 : usuarioLogado.perfil) === 'admin' && (usuarioLogado === null || usuarioLogado === void 0 ? void 0 : usuarioLogado.role) !== 'superadmin') {
                where = Object.assign(Object.assign({}, where), { criado_por_id: usuarioLogado.id });
            }
            const usuarios = await prismaClient_1.prisma.usuario.findMany({
                where,
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
            const { nome, email, senha, papeis, avatar } = req.body;
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
            if (avatar) {
                data.avatar = avatar;
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
                avatar: usuarioAtualizado.avatar,
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
    async atualizarMe(req, res) {
        try {
            console.log('DEBUG atualizarMe - req.user:', req.user);
            console.log('DEBUG atualizarMe - req.body:', req.body);
            if (!req.user || !req.user.id) {
                throw new AppError_1.AppError('Usuário não autenticado', 401);
            }
            const { nome, email, senha, avatar } = req.body;
            if (!nome || !email) {
                throw new AppError_1.AppError('Nome e email são obrigatórios', 400);
            }
            console.log('DEBUG atualizarMe - Buscando usuário com ID:', req.user.id);
            const usuario = await prismaClient_1.prisma.usuario.findUnique({
                where: { id: req.user.id }
            });
            console.log('DEBUG atualizarMe - Usuário encontrado:', usuario);
            if (!usuario) {
                throw new AppError_1.AppError('Usuário não encontrado', 404);
            }
            const usuarioExistente = await prismaClient_1.prisma.usuario.findUnique({
                where: { email }
            });
            if (usuarioExistente && usuarioExistente.id !== req.user.id) {
                throw new AppError_1.AppError('Email já cadastrado', 400);
            }
            const data = {
                nome,
                email
            };
            if (senha) {
                data.senha = await (0, bcryptjs_1.hash)(senha, 8);
            }
            if (avatar) {
                data.avatar = avatar;
            }
            console.log('DEBUG atualizarMe - Dados para atualização:', data);
            const usuarioAtualizado = await prismaClient_1.prisma.usuario.update({
                where: { id: req.user.id },
                data,
                include: {
                    papeis: {
                        include: {
                            permissoes: true
                        }
                    }
                }
            });
            console.log('DEBUG atualizarMe - Usuário atualizado:', usuarioAtualizado);
            return res.json({
                id: usuarioAtualizado.id,
                nome: usuarioAtualizado.nome,
                email: usuarioAtualizado.email,
                perfil: usuarioAtualizado.perfil,
                avatar: usuarioAtualizado.avatar,
                ativo: usuarioAtualizado.ativo,
                papeis: usuarioAtualizado.papeis
            });
        }
        catch (error) {
            console.error('DEBUG atualizarMe - Erro:', error);
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
    async alterarSenha(req, res) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }
            const { senhaAtual, novaSenha } = req.body;
            if (!senhaAtual || !novaSenha) {
                return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
            }
            const usuario = await prismaClient_1.prisma.usuario.findUnique({ where: { id: req.user.id } });
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            const senhaConfere = await (0, bcryptjs_1.compare)(senhaAtual, usuario.senha);
            if (!senhaConfere) {
                return res.status(400).json({ error: 'Senha atual incorreta' });
            }
            const novaSenhaHash = await (0, bcryptjs_1.hash)(novaSenha, 8);
            await prismaClient_1.prisma.usuario.update({ where: { id: req.user.id }, data: { senha: novaSenhaHash } });
            return res.json({ message: 'Senha alterada com sucesso!' });
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro ao alterar senha' });
        }
    }
}
exports.UsuarioController = UsuarioController;
