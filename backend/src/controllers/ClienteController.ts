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

      const cliente = await prisma.cliente.create({
        data: {
          nome,
          cpf,
          email,
          telefone,
          endereco,
          status: 'ativo'
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
} 