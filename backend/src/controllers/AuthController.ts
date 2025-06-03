import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body;
            if (!email || !senha) {
                throw new AppError('Email e senha são obrigatórios', 400);
            }
            const usuario = await prisma.usuario.findUnique({
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
                throw new AppError('Usuário não encontrado', 401);
            }
            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                throw new AppError('Senha inválida', 401);
            }
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, perfil: usuario.perfil, role: usuario.role, tenant_id: usuario.tenant_id },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );
            const permissoes = usuario.papeis.flatMap(papel =>
                papel.permissoes.map(permissao => permissao.codigo)
            );
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
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro no login:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async logout(req: Request, res: Response) {
        try {
            return res.json({ message: 'Logout realizado com sucesso' });
        } catch (error) {
            console.error('Erro no logout:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            const { token } = req.body;
            if (!token) {
                throw new AppError('Token não fornecido', 400);
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { id: number, email: string };
            const usuario = await prisma.usuario.findUnique({
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
                throw new AppError('Usuário não encontrado', 401);
            }
            const newToken = jwt.sign(
                { id: usuario.id, email: usuario.email, perfil: usuario.perfil, role: usuario.role, tenant_id: usuario.tenant_id },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );
            const permissoes = usuario.papeis.flatMap(papel =>
                papel.permissoes.map(permissao => permissao.codigo)
            );
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
        } catch (error) {
            if (error instanceof AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar token:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }

    async me(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Não autenticado' });
            }
            const usuario = await prisma.usuario.findUnique({
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
            const permissoes = usuario.papeis.flatMap(papel =>
                papel.permissoes.map(permissao => permissao.codigo)
            );
            return res.json({
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil,
                role: usuario.role,
                permissoes
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
