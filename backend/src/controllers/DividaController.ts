import { Request, Response } from 'express';
import { JwtPayload } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class DividaController {
  // Função auxiliar para atualizar o status do cliente
  private async atualizarStatusCliente(clienteId: number) {
    // Busca se existe alguma dívida não paga para o cliente
    const dividaNegativada = await prisma.divida.findFirst({
      where: {
        cliente_id: clienteId,
        status_negativado: true
      }
    });
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { status: dividaNegativada ? 'inativo' : 'ativo' }
    });
  }

  // Cadastro de dívida
  static async criar(req: Request, res: Response) {
    try {
      const usuario = req.user as JwtPayload;
      console.log('DEBUG req.user:', usuario);
      console.log('DEBUG req.body:', req.body);
      if (!usuario || usuario.tenant_id === undefined) {
        return res.status(400).json({ error: 'Usuário não autenticado corretamente.' });
      }
      const { cliente_id, nome_devedor, cpf_cnpj_devedor, valor, descricao } = req.body;
      if (!cliente_id || !valor) {
        return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
      }
      // Busca a empresa (tenant) pelo tenant_id do usuário
      const empresa = await prisma.tenant.findUnique({
        where: { id: usuario.tenant_id },
        select: { nome: true, cnpj: true }
      });
      if (!empresa) {
        return res.status(400).json({ error: 'Empresa (tenant) não encontrada.' });
      }
      // Cria a dívida sem protocolo
      const divida = await prisma.divida.create({
        data: {
          cliente_id,
          tenant_id: usuario.tenant_id,
          usuario_id: usuario.id,
          nome_devedor,
          cpf_cnpj_devedor,
          valor,
          descricao,
          protocolo: '', // temporário
          empresa: empresa.nome,
          cnpj_empresa: empresa.cnpj,
          status_negativado: true
        }
      });
      // Atualiza o status do cliente para 'inadimplente'
      await prisma.cliente.update({
        where: { id: cliente_id },
        data: { status: 'inadimplente' }
      });
      // Gera o protocolo baseado na data de criação e ID
      const data = new Date(divida.data_cadastro);
      const protocolo = `${data.getFullYear()}${String(data.getMonth()+1).padStart(2,'0')}${String(data.getDate()).padStart(2,'0')}${String(data.getHours()).padStart(2,'0')}${String(data.getMinutes()).padStart(2,'0')}${String(data.getSeconds()).padStart(2,'0')}-${divida.id}`;
      // Atualiza a dívida com o protocolo gerado
      const dividaAtualizada = await prisma.divida.update({
        where: { id: divida.id },
        data: { protocolo }
      });
      res.status(201).json(dividaAtualizada);
    } catch (error) {
      console.error('Erro ao cadastrar dívida:', error);
      res.status(500).json({ error: 'Erro ao cadastrar dívida' });
    }
  }

  // Listar dívidas do tenant do usuário logado
  static async listar(req: Request, res: Response) {
    try {
      const usuario = req.user as JwtPayload;
      const dividas = await prisma.divida.findMany({
        where: { tenant_id: usuario.tenant_id },
        include: { cliente: true }
      });
      // Corrige datas
      const dividasCorrigidas = dividas.map((d) => ({
        ...d,
        data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : '',
        created_at: d.data_cadastro ? d.data_cadastro.toISOString() : ''
      }));
      res.json(dividasCorrigidas);
    } catch (error) {
      console.error('Erro ao listar dívidas:', error);
      res.status(500).json({ error: 'Erro ao listar dívidas' });
    }
  }

  // Consulta pública de dívidas por CPF/CNPJ
  static async consultarPorCpfCnpj(req: Request, res: Response) {
    try {
      const { cpf_cnpj } = req.params;
      const dividas = await prisma.divida.findMany({
        where: { cpf_cnpj_devedor: cpf_cnpj, status_negativado: true },
        include: { cliente: true, tenant: { select: { nome: true } } }
      });
      res.json(dividas);
    } catch (error) {
      console.error('Erro ao consultar dívidas:', error);
      res.status(500).json({ error: 'Erro ao consultar dívidas' });
    }
  }

  // Editar dívida (apenas tenant criador)
  static async editar(req: Request, res: Response) {
    try {
      const usuario = req.user as JwtPayload;
      const id = Number(req.params.id);
      const divida = await prisma.divida.findUnique({ where: { id } });
      if (!divida) return res.status(404).json({ error: 'Dívida não encontrada' });
      // Só permite se o usuário for do mesmo tenant
      if (divida.tenant_id !== usuario.tenant_id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      const { nome_devedor, cpf_cnpj_devedor, valor, descricao, status_negativado } = req.body;
      const dividaAtualizada = await prisma.divida.update({
        where: { id },
        data: { nome_devedor, cpf_cnpj_devedor, valor, descricao, status_negativado }
      });
      res.json(dividaAtualizada);
    } catch (error) {
      console.error('Erro ao editar dívida:', error);
      res.status(500).json({ error: 'Erro ao editar dívida' });
    }
  }

  // Remover dívida (apenas tenant criador)
  static async remover(req: Request, res: Response) {
    try {
      const usuario = req.user as JwtPayload;
      const id = Number(req.params.id);
      const divida = await prisma.divida.findUnique({ where: { id } });
      if (!divida) return res.status(404).json({ error: 'Dívida não encontrada' });
      // Só permite se o usuário for do mesmo tenant
      if (divida.tenant_id !== usuario.tenant_id) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      await prisma.divida.delete({ where: { id } });
      // Atualiza status do cliente automaticamente
      const dividasNegativadas = await prisma.divida.findFirst({
        where: { cliente_id: divida.cliente_id, status_negativado: true }
      });
      await prisma.cliente.update({
        where: { id: divida.cliente_id },
        data: { status: dividasNegativadas ? 'inadimplente' : 'ativo' }
      });
      res.json({ message: 'Dívida removida com sucesso!' });
    } catch (error) {
      console.error('Erro ao remover dívida:', error);
      res.status(500).json({ error: 'Erro ao remover dívida' });
    }
  }

  async buscarPorCliente(req: Request, res: Response) {
    try {
      console.log('Parâmetros recebidos:', req.params, req.query);
      const { cliente_id } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const usuario = req.user as JwtPayload;

      // Verifica se o cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(cliente_id) }
      });

      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }

      // Busca todas as dívidas do cliente, independente do tenant
      const dividas = await prisma.divida.findMany({
        where: { cliente_id: Number(cliente_id) },
        include: {
          tenant: {
            select: {
              id: true,
              nome: true,
              cnpj: true,
              logo: true
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          data_cadastro: 'desc'
        }
      });

      // Corrige datas e monta URL da logo
      const baseUrl = process.env.API_URL || 'http://localhost:3000';
      const dividasCorrigidas = dividas.map((d) => ({
        ...d,
        tenant: d.tenant ? {
          ...d.tenant,
          logo: d.tenant.logo
            ? (d.tenant.logo.startsWith('http') ? d.tenant.logo : `${baseUrl}${d.tenant.logo}`)
            : null
        } : null,
        data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : '',
        created_at: d.data_cadastro ? d.data_cadastro.toISOString() : '',
        podeEditar: d.tenant_id === usuario.tenant_id
      }));

      const total = await prisma.divida.count({
        where: { cliente_id: Number(cliente_id) }
      });

      return res.json({
        data: dividasCorrigidas,
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
      const { status_negativado } = req.body;

      if (typeof status_negativado !== 'boolean') {
        throw new AppError('status_negativado é obrigatório e deve ser booleano', 400);
      }

      const divida = await prisma.divida.findUnique({
        where: { id: Number(id) }
      });

      if (!divida) {
        throw new AppError('Dívida não encontrada', 404);
      }

      const dividaAtualizada = await prisma.divida.update({
        where: { id: Number(id) },
        data: { status_negativado }
      });

      // Atualiza status do cliente
      // Se não houver mais dívidas negativadas, status = 'ativo'
      const dividasNegativadas = await prisma.divida.findFirst({
        where: { cliente_id: divida.cliente_id, status_negativado: true }
      });
      await prisma.cliente.update({
        where: { id: divida.cliente_id },
        data: { status: dividasNegativadas ? 'inadimplente' : 'ativo' }
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
      const { cliente_id, valor, descricao, status_negativado } = req.body;

      const divida = await prisma.divida.findUnique({
        where: { id: Number(id) }
      });

      if (!divida) {
        throw new AppError('Dívida não encontrada', 404);
      }

      const dividaAtualizada = await prisma.divida.update({
        where: { id: Number(id) },
        data: {
          cliente_id: Number(cliente_id),
          valor: Number(valor),
          descricao,
          status_negativado
        }
      });

      // Atualiza status do cliente
      await this.atualizarStatusCliente(Number(cliente_id));

      return res.json(dividaAtualizada);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao atualizar dívida:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const divida = await prisma.divida.findUnique({ where: { id: Number(id) } });
      if (!divida) {
        return res.status(404).json({ error: 'Dívida não encontrada' });
      }
      res.json(divida);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dívida' });
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const divida = await prisma.divida.findUnique({ where: { id: Number(id) } });
      if (!divida) {
        throw new AppError('Dívida não encontrada', 404);
      }
      await prisma.divida.delete({ where: { id: Number(id) } });
      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao deletar dívida:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}