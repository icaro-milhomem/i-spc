import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

interface TokenPayload {
    id: number;
    email: string;
    iat: number;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            usuario?: {
                id: number;
                email: string;
            };
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError('Token não fornecido', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as TokenPayload;

        const usuario = await prisma.usuario.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                papeis: {
                    select: {
                        nome: true,
                        permissoes: {
                            select: {
                                codigo: true
                            }
                        }
                    }
                }
            }
        });

        if (!usuario) {
            throw new AppError('Usuário não encontrado', 401);
        }

        req.usuario = {
            id: usuario.id,
            email: usuario.email
        };

        return next();
    } catch (error) {
        throw new AppError('Token inválido', 401);
    }
}; 