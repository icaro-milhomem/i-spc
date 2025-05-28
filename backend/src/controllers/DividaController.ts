import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class DividaController {
  async criar(req: Request, res: Response) {
    try {
      const { cliente_id, valor, data_vencimento, descricao } = req.body;

      if (!cliente_id || !valor || !data_vencimento) {
        throw new AppError('Cliente, valor e data de vencimento são obrigatórios', 400);
      }

      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(cliente_id) }
      });

      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }

      const divida = await prisma.divida.create({
        data: {
          cliente_id: Number(cliente_id),
          valor: Number(valor),
          data_vencimento: new Date(data_vencimento),
          descricao,
          status: 'pendente'
        }
      });

      return res.status(201).json(divida);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao criar dívida:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async buscarPorCliente(req: Request, res: Response) {
    try {
      console.log('Parâmetros recebidos:', req.params, req.query);
      const { cliente_id } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(cliente_id) }
      });

      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }

      const dividas = await prisma.divida.findMany({
        where: { cliente_id: Number(cliente_id) },
        orderBy: { data_vencimento: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      });

      const total = await prisma.divida.count({
        where: { cliente_id: Number(cliente_id) }
      });

      return res.json({
        data: dividas,
        total,
        page,
        limit
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao buscar dívidas do cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atualizarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        throw new AppError('Status é obrigatório', 400);
      }

      const divida = await prisma.divida.findUnique({
        where: { id: Number(id) }
      });

      if (!divida) {
        throw new AppError('Dívida não encontrada', 404);
      }

      const dividaAtualizada = await prisma.divida.update({
        where: { id: Number(id) },
        data: { status }
      });

      return res.json(dividaAtualizada);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao atualizar status da dívida:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { clienteId, valor, dataVencimento, status, descricao, ativo } = req.body;

      const divida = await prisma.divida.findUnique({
        where: { id: Number(id) }
      });

      if (!divida) {
        throw new AppError('Dívida não encontrada', 404);
      }

      const dividaAtualizada = await prisma.divida.update({
        where: { id: Number(id) },
        data: {
          cliente_id: Number(clienteId),
          valor: Number(valor),
          data_vencimento: new Date(dataVencimento),
          status,
          descricao,
          // Se existir campo ativo na tabela, descomente a linha abaixo
          // ativo
        }
      });

      return res.json(dividaAtualizada);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao atualizar dívida:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const divida = await prisma.divida.findUnique({
        where: { id: Number(id) }
      });

      if (!divida) {
        throw new AppError('Dívida não encontrada', 404);
      }

      return res.json(divida);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao buscar dívida:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 