import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Erro:', err);

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.message
    });
  }

  // Erro de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Não autorizado',
      details: err.message
    });
  }

  // Erro de permissão
  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      error: 'Acesso negado',
      details: err.message
    });
  }

  // Erro de recurso não encontrado
  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      error: 'Recurso não encontrado',
      details: err.message
    });
  }

  // Erro de conflito (ex: registro duplicado)
  if (err.name === 'ConflictError') {
    return res.status(409).json({
      error: 'Conflito',
      details: err.message
    });
  }

  // Erro de banco de dados
  if (err.code === '23505') { // Código de erro de violação de chave única no PostgreSQL
    return res.status(409).json({
      error: 'Registro duplicado',
      details: err.message
    });
  }

  // Erro interno do servidor
  res.status(err.statusCode || 500).json({
    error: 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}; 