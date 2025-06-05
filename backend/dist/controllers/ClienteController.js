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
                return res.status(401).json({ error: 'Usuário não autenticado corretamente.' });
            }
            const cliente = await prismaClient_1.prisma.cliente.findFirst({ where: { id: Number(id), tenant_id: usuario.tenant_id } });
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }
            res.json(cliente);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao buscar cliente' });
        }
    }
    async listar(req, res) {
        try {
            const usuario = req.user;
            if (!usuario || !usuario.tenant_id) {
                return res.status(401).json({ error: 'Usuário não autenticado corretamente.' });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const [clientes, total] = await Promise.all([
                prismaClient_1.prisma.cliente.findMany({
                    where: { tenant_id: usuario.tenant_id },
                    skip,
                    take: limit,
                }),
                prismaClient_1.prisma.cliente.count({ where: { tenant_id: usuario.tenant_id } }),
            ]);
            res.json({
                data: clientes,
                total,
                page,
                limit,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao listar clientes' });
        }
    }
}
exports.ClienteController = ClienteController;
