import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prismaClient';

interface JwtPayload {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo') as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  console.log('DEBUG isAdmin req.user:', req.user); // Debug do conteúdo do usuário autenticado
  if (!req.user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (req.user.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem acessar este recurso.' });
  }

  next();
}

export function hasPermission(permissionCode: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    try {
      console.log('Verificando permissão para usuário:', req.user.id);
      
      const usuario = await prisma.usuario.findUnique({
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

      const temPermissao = usuario.papeis.some(papel =>
        papel.permissoes.some(permissao => permissao.codigo === permissionCode)
      );

      console.log('Tem permissão?', temPermissao);

      if (!temPermissao) {
        return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para acessar este recurso.' });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}