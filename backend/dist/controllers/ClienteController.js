"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class ClienteController {
    async criar(req, res) {
        try {
            const { nome, cpf, email, telefone, endereco } = req.body;
            if (!nome || !cpf) {
                throw new AppError_1.AppError('Nome e CPF são obrigatórios', 400);
            }
            const clienteExistente = await prismaClient_1.prisma.cliente.findUnique({
                where: { cpf }
            });
            if (clienteExistente) {
                throw new AppError_1.AppError('CPF já cadastrado', 400);
            }
            if (!req.user || !req.user.id) {
                throw new AppError_1.AppError('Usuário autenticado não encontrado', 401);
            }
            const cliente = await prismaClient_1.prisma.cliente.create({
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
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao criar cliente:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorCPF(req, res) {
        try {
            const { cpf } = req.params;
            const cliente = await prismaClient_1.prisma.cliente.findUnique({
                where: { cpf },
                include: {
                    dividas: true
                }
            });
            if (!cliente) {
                throw new AppError_1.AppError('Cliente não encontrado', 404);
            }
            return res.json(cliente);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar cliente:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizarStatus(req, res) {
        try {
            const { cpf } = req.params;
            const { status } = req.body;
            if (!status) {
                throw new AppError_1.AppError('Status é obrigatório', 400);
            }
            const cliente = await prismaClient_1.prisma.cliente.findUnique({
                where: { cpf }
            });
            if (!cliente) {
                throw new AppError_1.AppError('Cliente não encontrado', 404);
            }
            const clienteAtualizado = await prismaClient_1.prisma.cliente.update({
                where: { cpf },
                data: { status }
            });
            return res.json(clienteAtualizado);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar status do cliente:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async consultarPorCpfOuNome(req, res) {
        try {
            const { cpf, nome } = req.query;
            if (!cpf && !nome) {
                throw new AppError_1.AppError('Informe o CPF ou o nome para consulta', 400);
            }
            const cliente = await prismaClient_1.prisma.cliente.findFirst({
                where: Object.assign(Object.assign({}, (cpf ? { cpf: String(cpf) } : {})), (nome ? { nome: { contains: String(nome), mode: 'insensitive' } } : {})),
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
                throw new AppError_1.AppError('Cliente não encontrado', 404);
            }
            const baseUrl = process.env.API_URL || 'http://localhost:3000';
            const clienteComDividasCorrigidas = Object.assign(Object.assign({}, cliente), { dividas: cliente.dividas.map((d) => (Object.assign(Object.assign({}, d), { tenant: d.tenant ? Object.assign(Object.assign({}, d.tenant), { logo: d.tenant.logo
                            ? (d.tenant.logo.startsWith('http') ? d.tenant.logo : `${baseUrl}${d.tenant.logo}`)
                            : null }) : null, data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : '', created_at: d.data_cadastro ? d.data_cadastro.toISOString() : '' }))) });
            return res.json(clienteComDividasCorrigidas);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao consultar cliente:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { nome, cpf, email, telefone, cep, rua, numero, complemento, bairro, cidade, estado } = req.body;
            if (!nome || !cpf) {
                throw new AppError_1.AppError('Nome e CPF são obrigatórios', 400);
            }
            const cliente = await prismaClient_1.prisma.cliente.findUnique({ where: { id: Number(id) } });
            if (!cliente) {
                throw new AppError_1.AppError('Cliente não encontrado', 404);
            }
            const cpfExistente = await prismaClient_1.prisma.cliente.findFirst({ where: { cpf, id: { not: Number(id) } } });
            if (cpfExistente) {
                throw new AppError_1.AppError('CPF já cadastrado', 400);
            }
            const endereco = [
                rua,
                numero ? `, ${numero}` : '',
                complemento ? `, ${complemento}` : '',
                bairro ? `, ${bairro}` : '',
                cidade ? `, ${cidade}` : '',
                estado ? ` - ${estado}` : '',
                cep ? `, CEP: ${cep}` : ''
            ].join('').replace(/^,\s*/, '');
            const clienteAtualizado = await prismaClient_1.prisma.cliente.update({
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
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar cliente:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario = req.user;
            if (!usuario || !usuario.tenant_id) {
                throw new AppError_1.AppError('Usuário não autenticado corretamente', 401);
            }
            const cliente = await prismaClient_1.prisma.cliente.findUnique({
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
                throw new AppError_1.AppError('Cliente não encontrado', 404);
            }
            const enderecosAdicionais = await prismaClient_1.prisma.enderecoClienteEmpresa.findMany({
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
            const enderecoOriginal = cliente.endereco ? cliente.endereco.split(',').map((part) => part.trim()) : [];
            const [cep = '', rua = '', numero = '', complemento = '', bairro = '', cidade = '', estado = ''] = enderecoOriginal;
            return res.json(Object.assign(Object.assign({}, cliente), { ativo: cliente.status === 'ATIVO', endereco: {
                    cep,
                    rua,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado
                }, enderecosAdicionais, podeEditar: cliente.tenant_id === usuario.tenant_id }));
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar cliente:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async listar(req, res) {
        try {
            const usuario = req.user;
            const { page = 1, limit = 10, search = '' } = req.query;
            if (!usuario || !usuario.tenant_id) {
                throw new AppError_1.AppError('Usuário não autenticado corretamente', 401);
            }
            const skip = (Number(page) - 1) * Number(limit);
            const clientes = await prismaClient_1.prisma.cliente.findMany({
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
            const total = await prismaClient_1.prisma.cliente.count({
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
            const clientesFormatados = clientes.map(cliente => {
                const enderecoParts = cliente.endereco ? cliente.endereco.split(',').map((part) => part.trim()) : [];
                const [cep = '', rua = '', numero = '', complemento = '', bairro = '', cidade = '', estado = ''] = enderecoParts;
                return Object.assign(Object.assign({}, cliente), { ativo: cliente.status === 'ATIVO', endereco: {
                        cep,
                        rua,
                        numero,
                        complemento,
                        bairro,
                        cidade,
                        estado
                    }, permissoes: {
                        podeEditar: cliente.tenant_id === usuario.tenant_id,
                        podeExcluir: cliente.tenant_id === usuario.tenant_id,
                        podeAdicionarEndereco: true,
                        podeAdicionarDivida: true
                    } });
            });
            return res.json({
                clientes: clientesFormatados,
                total,
                totalPages: Math.ceil(total / Number(limit)),
                currentPage: Number(page)
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao listar clientes:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.ClienteController = ClienteController;
