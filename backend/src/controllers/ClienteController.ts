import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class ClienteController {
  async criar(req: Request, res: Response) {
    try {
      const { nome, cpf, email, telefone, endereco } = req.body;

      if (!nome || !cpf) {
        throw new AppError('Nome e CPF são obrigatórios', 400);
      }

      const clienteExistente = await prisma.cliente.findUnique({
        where: { cpf }
      });

      if (clienteExistente) {
        throw new AppError('CPF já cadastrado', 400);
      }

      if (!req.user || !req.user.id) {
        throw new AppError('Usuário autenticado não encontrado', 401);
      }

      const cliente = await prisma.cliente.create({
        data: {
          nome,
          cpf,
          email,
          telefone,
          endereco,
          status: 'ativo',
          criado_por_id: req.user.id,
          tenant_id: req.user.tenant_id // Adicionado para garantir associação ao tenant
        }
      });

      return res.status(201).json(cliente);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao criar cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async buscarPorCPF(req: Request, res: Response) {
    try {
      const { cpf } = req.params;

      const cliente = await prisma.cliente.findUnique({
        where: { cpf },
        include: {
          dividas: true
        }
      });

      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }

      return res.json(cliente);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao buscar cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { cpf } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new AppError('Status é obrigatório', 400);
      }

      const cliente = await prisma.cliente.findUnique({
        where: { cpf }
      });

      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }

      const clienteAtualizado = await prisma.cliente.update({
        where: { cpf },
        data: { status }
      });

      return res.json(clienteAtualizado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao atualizar status do cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async consultarPorCpfOuNome(req: Request, res: Response) {
    try {
      const { cpf, nome } = req.query;
      if (!cpf && !nome) {
        throw new AppError('Informe o CPF ou o nome para consulta', 400);
      }

      const cliente = await prisma.cliente.findFirst({
        where: {
          ...(cpf ? { cpf: String(cpf) } : {}),
          ...(nome ? { nome: { contains: String(nome), mode: 'insensitive' } } : {})
        },
        include: {
          dividas: true
        }
      });

      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }

      return res.json(cliente);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao consultar cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, cpf, email, telefone, cep, rua, numero, complemento, bairro, cidade, estado } = req.body;

      if (!nome || !cpf) {
        throw new AppError('Nome e CPF são obrigatórios', 400);
      }

      const cliente = await prisma.cliente.findUnique({ where: { id: Number(id) } });
      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }

      // Verifica se o novo CPF já está em uso por outro cliente
      const cpfExistente = await prisma.cliente.findFirst({ where: { cpf, id: { not: Number(id) } } });
      if (cpfExistente) {
        throw new AppError('CPF já cadastrado', 400);
      }

      // Monta o endereço completo
      const endereco = [
        rua,
        numero ? `, ${numero}` : '',
        complemento ? `, ${complemento}` : '',
        bairro ? `, ${bairro}` : '',
        cidade ? `, ${cidade}` : '',
        estado ? ` - ${estado}` : '',
        cep ? `, CEP: ${cep}` : ''
      ].join('').replace(/^,\s*/, '');

      const clienteAtualizado = await prisma.cliente.update({
        where: { id: Number(id) },
        data: {
          nome,
          cpf,
          email,
          telefone,
          endereco
        }
      });

      return res.json(clienteAtualizado);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao atualizar cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const usuario = req.user;
      if (!usuario || !usuario.tenant_id) {
        return res.status(401).json({ error: 'Usuário não autenticado corretamente.' });
      }
      const cliente = await prisma.cliente.findFirst({ where: { id: Number(id), tenant_id: usuario.tenant_id } });
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const usuario = req.user;
      if (!usuario || !usuario.tenant_id) {
        return res.status(401).json({ error: 'Usuário não autenticado corretamente.' });
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const [clientes, total] = await Promise.all([
        prisma.cliente.findMany({
          where: { tenant_id: usuario.tenant_id },
          skip,
          take: limit,
        }),
        prisma.cliente.count({ where: { tenant_id: usuario.tenant_id } }),
      ]);
      res.json({
        data: clientes,
        total,
        page,
        limit,
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar clientes' });
    }
  }
}