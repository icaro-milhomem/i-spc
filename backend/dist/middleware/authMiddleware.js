"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new AppError_1.AppError('Token não fornecido', 401);
    }
    const [, token] = authHeader.split(' ');
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
        const usuario = await prismaClient_1.prisma.usuario.findUnique({
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
            throw new AppError_1.AppError('Usuário não encontrado', 401);
        }
        req.usuario = {
            id: usuario.id,
            email: usuario.email
        };
        return next();
    }
    catch (error) {
        throw new AppError_1.AppError('Token inválido', 401);
    }
};
exports.authMiddleware = authMiddleware;
