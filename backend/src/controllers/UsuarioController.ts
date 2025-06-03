import { hash } from 'bcryptjs';
import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class UsuarioController {
  async criar(req: Request, res: Response) {
    try {
      console.log('REQ BODY:', req.body);
      const { nome, email, senha, perfil } = req.body;

      if (!nome || !email || !senha || !perfil) {
        throw new AppError('Nome, email, senha e perfil são obrigatórios', 400);
      }

      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
      });

      if (usuarioExistente) {
        throw new AppError('Email já cadastrado', 400);
      }

      if (!req.user || !req.user.id) {
        throw new AppError('Usuário autenticado não encontrado', 401);
      }

      const senhaHash = await hash(senha, 8);

      // Buscar o papel conforme o perfil
      const papel = await prisma.papel.findUnique({
        where: { nome: perfil }
      });

      if (!papel) {
        throw new AppError('Papel não encontrado', 500);
      }

      const usuario = await prisma.usuario.create({
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
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const usuarioLogado = req.user;
      let where: any = {
        OR: [
          { role: null },
          { role: { not: 'superadmin' } }
        ]
      };

      // Se for admin (mas não superadmin), filtra pelos usuários criados por ele
      if (usuarioLogado?.perfil === 'admin' && usuarioLogado?.role !== 'superadmin') {
        where = {
          ...where,
          criado_por_id: usuarioLogado.id
        };
      }

      const usuarios = await prisma.usuario.findMany({
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
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
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
        throw new AppError('Usuário não encontrado', 404);
      }

      return res.json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        ativo: usuario.ativo,
        papeis: usuario.papeis
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, email, senha, papeis } = req.body;

      if (!nome || !email) {
        throw new AppError('Nome e email são obrigatórios', 400);
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: Number(id) }
      });

      if (!usuario) {
        throw new AppError('Usuário não encontrado', 404);
      }

      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email }
      });

      if (usuarioExistente && usuarioExistente.id !== Number(id)) {
        throw new AppError('Email já cadastrado', 400);
      }

      const data: {
        nome: string;
        email: string;
        senha?: string;
        papeis: { set: { id: number }[] };
      } = {
        nome,
        email,
        papeis: {
          set: papeis?.map((id: number) => ({ id })) || []
        }
      };

      if (senha) {
        data.senha = await hash(senha, 8);
      }

      const usuarioAtualizado = await prisma.usuario.update({
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
        ativo: usuarioAtualizado.ativo,
        papeis: usuarioAtualizado.papeis
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const usuario = await prisma.usuario.findUnique({
        where: { id: Number(id) }
      });

      if (!usuario) {
        throw new AppError('Usuário não encontrado', 404);
      }

      await prisma.usuario.delete({
        where: { id: Number(id) }
      });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao deletar usuário:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}