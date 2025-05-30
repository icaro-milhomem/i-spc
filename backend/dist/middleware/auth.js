"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.isAdmin = isAdmin;
exports.hasPermission = hasPermission;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../database/prismaClient");
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'segredo');
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
function isAdmin(req, res, next) {
    console.log('DEBUG isAdmin req.user:', req.user);
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    if (req.user.perfil !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso.' });
    }
    next();
}
function hasPermission(permissionCode) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Não autorizado' });
        }
        try {
            console.log('Verificando permissão para usuário:', req.user.id);
            const usuario = await prismaClient_1.prisma.usuario.findUnique({
                where: { id: req.user.id },
                include: {
                    papeis: {
                        include: {
                            permissoes: true
                        }
                    }
                }
            });
            if (!usuario) {
                console.error('Usuário não encontrado:', req.user.id);
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }
            console.log('Papeis do usuário:', usuario.papeis);
            console.log('Permissões do usuário:', usuario.papeis.flatMap(p => p.permissoes));
            const temPermissao = usuario.papeis.some(papel => papel.permissoes.some(permissao => permissao.codigo === permissionCode));
            console.log('Tem permissão?', temPermissao);
            if (!temPermissao) {
                return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para acessar este recurso.' });
            }
            next();
        }
        catch (error) {
            console.error('Erro ao verificar permissão:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    };
}
