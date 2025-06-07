"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class AuthController {
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            if (!email || !senha) {
                throw new AppError_1.AppError('Email e senha são obrigatórios', 400);
            }
            const usuario = await prismaClient_1.prisma.usuario.findUnique({
                where: { email },
                include: {
                    papeis: {
                        include: {
                            permissoes: true
                        }
                    }
                }
            });
            if (!usuario) {
                throw new AppError_1.AppError('Usuário não encontrado', 401);
            }
            const senhaValida = await bcrypt_1.default.compare(senha, usuario.senha);
            if (!senhaValida) {
                throw new AppError_1.AppError('Senha inválida', 401);
            }
            const token = jsonwebtoken_1.default.sign({ id: usuario.id, email: usuario.email, perfil: usuario.perfil, role: usuario.role, tenant_id: usuario.tenant_id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
            const permissoes = usuario.papeis.flatMap(papel => papel.permissoes.map(permissao => permissao.codigo));
            return res.json({
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil,
                    role: usuario.role,
                    tenant_id: usuario.tenant_id,
                    permissoes
                },
                token
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro no login:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async logout(req, res) {
        try {
            return res.json({ message: 'Logout realizado com sucesso' });
        }
        catch (error) {
            console.error('Erro no logout:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async refreshToken(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                throw new AppError_1.AppError('Token não fornecido', 400);
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
            const usuario = await prismaClient_1.prisma.usuario.findUnique({
                where: { id: decoded.id },
                include: {
                    papeis: {
                        include: {
                            permissoes: true
                        }
                    }
                }
            });
            if (!usuario) {
                throw new AppError_1.AppError('Usuário não encontrado', 401);
            }
            const newToken = jsonwebtoken_1.default.sign({ id: usuario.id, email: usuario.email, perfil: usuario.perfil, role: usuario.role, tenant_id: usuario.tenant_id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '24h' });
            const permissoes = usuario.papeis.flatMap(papel => papel.permissoes.map(permissao => permissao.codigo));
            return res.json({
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    perfil: usuario.perfil,
                    role: usuario.role,
                    tenant_id: usuario.tenant_id,
                    permissoes
                },
                token: newToken
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar token:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async me(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Não autenticado' });
            }
            const usuario = await prismaClient_1.prisma.usuario.findUnique({
                where: { id: userId },
                include: {
                    papeis: {
                        include: {
                            permissoes: true
                        }
                    }
                }
            });
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            const permissoes = usuario.papeis.flatMap(papel => papel.permissoes.map(permissao => permissao.codigo));
            return res.json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                role: usuario.role,
                avatar: usuario.avatar,
                permissoes
            });
        }
        catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.AuthController = AuthController;
