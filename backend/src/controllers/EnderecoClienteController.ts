import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

class EnderecoClienteController {
  async adicionarEndereco(req: Request, res: Response) {
    const { cliente_id } = req.params;
    const { cep, rua, numero, complemento, bairro, cidade, estado } = req.body;
    const tenant_id = req.user?.tenant_id;

    if (!tenant_id) {
      throw new AppError('Usuário não autenticado', 401);
    }

    // Verifica se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(cliente_id) }
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    // Cria o novo endereço
    const endereco = await prisma.enderecoClienteEmpresa.create({
      data: {
        cep,
        rua,
        numero,
        complemento: complemento || '',
        bairro,
        cidade,
        estado,
        cliente_id: Number(cliente_id),
        tenant_id
      }
    });

    return res.status(201).json(endereco);
  }

  async listarEnderecos(req: Request, res: Response) {
    const { cliente_id } = req.params;
    const tenant_id = req.user?.tenant_id;

    if (!tenant_id) {
      throw new AppError('Usuário não autenticado', 401);
    }

    // Verifica se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: Number(cliente_id) }
    });

    if (!cliente) {
      throw new AppError('Cliente não encontrado', 404);
    }

    // Busca todos os endereços do cliente
    const enderecos = await prisma.enderecoClienteEmpresa.findMany({
      where: {
        cliente_id: Number(cliente_id)
      },
      include: {
        tenant: {
          select: {
            id: true,
            nome: true,
            cnpj: true
          }
        }
      }
    });

    return res.json(enderecos);
  }

  async removerEndereco(req: Request, res: Response) {
    const { id } = req.params;
    const tenant_id = req.user?.tenant_id;

    if (!tenant_id) {
      throw new AppError('Usuário não autenticado', 401);
    }

    // Verifica se o endereço existe e pertence ao tenant
    const endereco = await prisma.enderecoClienteEmpresa.findFirst({
      where: {
        id: Number(id),
        tenant_id
      }
    });

    if (!endereco) {
      throw new AppError('Endereço não encontrado ou não pertence ao seu tenant', 404);
    }

    // Remove o endereço
    await prisma.enderecoClienteEmpresa.delete({
      where: {
        id: Number(id)
      }
    });

    return res.status(204).send();
  }
}

export default new EnderecoClienteController(); 