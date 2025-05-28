"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.isAdmin = isAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
    if (!req.user) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    if (req.user.perfil !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso.' });
    }
    next();
}
