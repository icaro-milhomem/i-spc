import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { AppError } from '../utils/AppError';

export class ClienteController {
  async criar(req: Request, res: Response): Promise<Response> {
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
          tenant_id: req.user.tenant_id
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

  async buscarPorCPF(req: Request, res: Response): Promise<Response> {
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

  async atualizarStatus(req: Request, res: Response): Promise<Response> {
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

  async consultarPorCpfOuNome(req: Request, res: Response): Promise<Response> {
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
          dividas: {
            where: { status_negativado: true },
            include: {
              tenant: {
                select: {
                  id: true,
                  nome: true,
                  cnpj: true,
                  logo: true
                }
              }
            }
          }
        }
      });

      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }

      // Corrige datas e monta URL da logo
      const baseUrl = process.env.API_URL || 'http://localhost:3000';
      const clienteComDividasCorrigidas = {
        ...cliente,
        dividas: cliente.dividas.map((d: any) => ({
          ...d,
          tenant: d.tenant ? {
            ...d.tenant,
            logo: d.tenant.logo
              ? (d.tenant.logo.startsWith('http') ? d.tenant.logo : `${baseUrl}${d.tenant.logo}`)
              : null
          } : null,
          data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : '',
          created_at: d.data_cadastro ? d.data_cadastro.toISOString() : ''
        }))
      };

      return res.json(clienteComDividasCorrigidas);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao consultar cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async atualizar(req: Request, res: Response): Promise<Response> {
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

  async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const usuario = req.user;

      if (!usuario || !usuario.tenant_id) {
        throw new AppError('Usuário não autenticado corretamente', 401);
      }

      const cliente = await prisma.cliente.findUnique({
        where: { id: Number(id) },
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

      if (!cliente) {
        throw new AppError('Cliente não encontrado', 404);
      }

      // Busca os endereços de cobrança adicionais
      const enderecosAdicionais = await prisma.enderecoClienteEmpresa.findMany({
        where: {
          cliente_id: Number(id)
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

      // Formata o endereço original
      const enderecoOriginal = cliente.endereco ? cliente.endereco.split(',').map((part: string) => part.trim()) : [];
      const [cep = '', rua = '', numero = '', complemento = '', bairro = '', cidade = '', estado = ''] = enderecoOriginal;

      // Retorna os dados formatados
      return res.json({
        ...cliente,
        ativo: cliente.status === 'ATIVO',
        endereco: {
          cep,
          rua,
          numero,
          complemento,
          bairro,
          cidade,
          estado
        },
        enderecosAdicionais,
        podeEditar: cliente.tenant_id === usuario.tenant_id
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao buscar cliente:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async listar(req: Request, res: Response): Promise<Response> {
    try {
      const usuario = req.user;
      const { page = 1, limit = 10, search = '' } = req.query;

      if (!usuario || !usuario.tenant_id) {
        throw new AppError('Usuário não autenticado corretamente', 401);
      }

      const skip = (Number(page) - 1) * Number(limit);

      // Busca clientes do tenant atual e de outros tenants
      const clientes = await prisma.cliente.findMany({
        where: {
          AND: [
            {
              OR: [
                { tenant_id: usuario.tenant_id },
                { tenant_id: { not: usuario.tenant_id } }
              ]
            },
            search ? {
              OR: [
                { nome: { contains: String(search), mode: 'insensitive' } },
                { cpf: { contains: String(search) } }
              ]
            } : {}
          ]
        },
        include: {
          tenant: {
            select: {
              id: true,
              nome: true,
              cnpj: true
            }
          }
        },
        skip,
        take: Number(limit),
        orderBy: { nome: 'asc' }
      });

      const total = await prisma.cliente.count({
        where: {
          AND: [
            {
              OR: [
                { tenant_id: usuario.tenant_id },
                { tenant_id: { not: usuario.tenant_id } }
              ]
            },
            search ? {
              OR: [
                { nome: { contains: String(search), mode: 'insensitive' } },
                { cpf: { contains: String(search) } }
              ]
            } : {}
          ]
        }
      });

      // Formata os dados dos clientes
      const clientesFormatados = clientes.map(cliente => {
        const enderecoParts = cliente.endereco ? cliente.endereco.split(',').map((part: string) => part.trim()) : [];
        const [cep = '', rua = '', numero = '', complemento = '', bairro = '', cidade = '', estado = ''] = enderecoParts;

        return {
          ...cliente,
          ativo: cliente.status === 'ATIVO',
          endereco: {
            cep,
            rua,
            numero,
            complemento,
            bairro,
            cidade,
            estado
          },
          permissoes: {
            podeEditar: cliente.tenant_id === usuario.tenant_id,
            podeExcluir: cliente.tenant_id === usuario.tenant_id,
            podeAdicionarEndereco: true,
            podeAdicionarDivida: true
          }
        };
      });

      return res.json({
        clientes: clientesFormatados,
        total,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page)
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      console.error('Erro ao listar clientes:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}