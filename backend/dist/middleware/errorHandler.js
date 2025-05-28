"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Erro:', err);
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.message
        });
    }
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Não autorizado',
            details: err.message
        });
    }
    if (err.name === 'ForbiddenError') {
        return res.status(403).json({
            error: 'Acesso negado',
            details: err.message
        });
    }
    if (err.name === 'NotFoundError') {
        return res.status(404).json({
            error: 'Recurso não encontrado',
            details: err.message
        });
    }
    if (err.name === 'ConflictError') {
        return res.status(409).json({
            error: 'Conflito',
            details: err.message
        });
    }
    if (err.code === '23505') {
        return res.status(409).json({
            error: 'Registro duplicado',
            details: err.message
        });
    }
    res.status(err.statusCode || 500).json({
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};
exports.errorHandler = errorHandler;
