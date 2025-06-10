"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DividaController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const AppError_1 = require("../utils/AppError");
class DividaController {
    async atualizarStatusCliente(clienteId) {
        const dividaNegativada = await prismaClient_1.prisma.divida.findFirst({
            where: {
                cliente_id: clienteId,
                status_negativado: true
            }
        });
        await prismaClient_1.prisma.cliente.update({
            where: { id: clienteId },
            data: { status: dividaNegativada ? 'inativo' : 'ativo' }
        });
    }
    static async criar(req, res) {
        try {
            const usuario = req.user;
            console.log('DEBUG req.user:', usuario);
            console.log('DEBUG req.body:', req.body);
            if (!usuario || usuario.tenant_id === undefined) {
                return res.status(400).json({ error: 'Usuário não autenticado corretamente.' });
            }
            const { cliente_id, nome_devedor, cpf_cnpj_devedor, valor, descricao } = req.body;
            if (!cliente_id || !valor) {
                return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
            }
            const empresa = await prismaClient_1.prisma.tenant.findUnique({
                where: { id: usuario.tenant_id },
                select: { nome: true, cnpj: true }
            });
            if (!empresa) {
                return res.status(400).json({ error: 'Empresa (tenant) não encontrada.' });
            }
            const divida = await prismaClient_1.prisma.divida.create({
                data: {
                    cliente_id,
                    tenant_id: usuario.tenant_id,
                    usuario_id: usuario.id,
                    nome_devedor,
                    cpf_cnpj_devedor,
                    valor,
                    descricao,
                    protocolo: '',
                    empresa: empresa.nome,
                    cnpj_empresa: empresa.cnpj,
                    status_negativado: true
                }
            });
            await prismaClient_1.prisma.cliente.update({
                where: { id: cliente_id },
                data: { status: 'inadimplente' }
            });
            const data = new Date(divida.data_cadastro);
            const protocolo = `${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, '0')}${String(data.getDate()).padStart(2, '0')}${String(data.getHours()).padStart(2, '0')}${String(data.getMinutes()).padStart(2, '0')}${String(data.getSeconds()).padStart(2, '0')}-${divida.id}`;
            const dividaAtualizada = await prismaClient_1.prisma.divida.update({
                where: { id: divida.id },
                data: { protocolo }
            });
            res.status(201).json(dividaAtualizada);
        }
        catch (error) {
            console.error('Erro ao cadastrar dívida:', error);
            res.status(500).json({ error: 'Erro ao cadastrar dívida' });
        }
    }
    static async listar(req, res) {
        try {
            const usuario = req.user;
            const dividas = await prismaClient_1.prisma.divida.findMany({
                where: { tenant_id: usuario.tenant_id },
                include: { cliente: true }
            });
            const dividasCorrigidas = dividas.map((d) => (Object.assign(Object.assign({}, d), { data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : '', created_at: d.data_cadastro ? d.data_cadastro.toISOString() : '' })));
            res.json(dividasCorrigidas);
        }
        catch (error) {
            console.error('Erro ao listar dívidas:', error);
            res.status(500).json({ error: 'Erro ao listar dívidas' });
        }
    }
    static async consultarPorCpfCnpj(req, res) {
        try {
            const { cpf_cnpj } = req.params;
            const dividas = await prismaClient_1.prisma.divida.findMany({
                where: { cpf_cnpj_devedor: cpf_cnpj, status_negativado: true },
                include: { cliente: true, tenant: { select: { nome: true } } }
            });
            res.json(dividas);
        }
        catch (error) {
            console.error('Erro ao consultar dívidas:', error);
            res.status(500).json({ error: 'Erro ao consultar dívidas' });
        }
    }
    static async editar(req, res) {
        try {
            const usuario = req.user;
            const id = Number(req.params.id);
            const divida = await prismaClient_1.prisma.divida.findUnique({ where: { id } });
            if (!divida)
                return res.status(404).json({ error: 'Dívida não encontrada' });
            if (divida.tenant_id !== usuario.tenant_id) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            const { nome_devedor, cpf_cnpj_devedor, valor, descricao, status_negativado } = req.body;
            const dividaAtualizada = await prismaClient_1.prisma.divida.update({
                where: { id },
                data: { nome_devedor, cpf_cnpj_devedor, valor, descricao, status_negativado }
            });
            res.json(dividaAtualizada);
        }
        catch (error) {
            console.error('Erro ao editar dívida:', error);
            res.status(500).json({ error: 'Erro ao editar dívida' });
        }
    }
    static async remover(req, res) {
        try {
            const usuario = req.user;
            const id = Number(req.params.id);
            const divida = await prismaClient_1.prisma.divida.findUnique({ where: { id } });
            if (!divida)
                return res.status(404).json({ error: 'Dívida não encontrada' });
            if (divida.tenant_id !== usuario.tenant_id) {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            await prismaClient_1.prisma.divida.delete({ where: { id } });
            const dividasNegativadas = await prismaClient_1.prisma.divida.findFirst({
                where: { cliente_id: divida.cliente_id, status_negativado: true }
            });
            await prismaClient_1.prisma.cliente.update({
                where: { id: divida.cliente_id },
                data: { status: dividasNegativadas ? 'inadimplente' : 'ativo' }
            });
            res.json({ message: 'Dívida removida com sucesso!' });
        }
        catch (error) {
            console.error('Erro ao remover dívida:', error);
            res.status(500).json({ error: 'Erro ao remover dívida' });
        }
    }
    async buscarPorCliente(req, res) {
        try {
            console.log('Parâmetros recebidos:', req.params, req.query);
            const { cliente_id } = req.params;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const usuario = req.user;
            const cliente = await prismaClient_1.prisma.cliente.findUnique({
                where: { id: Number(cliente_id) }
            });
            if (!cliente) {
                throw new AppError_1.AppError('Cliente não encontrado', 404);
            }
            const dividas = await prismaClient_1.prisma.divida.findMany({
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
            const baseUrl = process.env.API_URL || 'http://localhost:3000';
            const dividasCorrigidas = dividas.map((d) => (Object.assign(Object.assign({}, d), { tenant: d.tenant ? Object.assign(Object.assign({}, d.tenant), { logo: d.tenant.logo
                        ? (d.tenant.logo.startsWith('http') ? d.tenant.logo : `${baseUrl}${d.tenant.logo}`)
                        : null }) : null, data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : '', created_at: d.data_cadastro ? d.data_cadastro.toISOString() : '', podeEditar: d.tenant_id === usuario.tenant_id })));
            const total = await prismaClient_1.prisma.divida.count({
                where: { cliente_id: Number(cliente_id) }
            });
            return res.json({
                data: dividasCorrigidas,
                total,
                page,
                limit
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao buscar dívidas do cliente:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status_negativado } = req.body;
            if (typeof status_negativado !== 'boolean') {
                throw new AppError_1.AppError('status_negativado é obrigatório e deve ser booleano', 400);
            }
            const divida = await prismaClient_1.prisma.divida.findUnique({
                where: { id: Number(id) }
            });
            if (!divida) {
                throw new AppError_1.AppError('Dívida não encontrada', 404);
            }
            const dividaAtualizada = await prismaClient_1.prisma.divida.update({
                where: { id: Number(id) },
                data: { status_negativado }
            });
            const dividasNegativadas = await prismaClient_1.prisma.divida.findFirst({
                where: { cliente_id: divida.cliente_id, status_negativado: true }
            });
            await prismaClient_1.prisma.cliente.update({
                where: { id: divida.cliente_id },
                data: { status: dividasNegativadas ? 'inadimplente' : 'ativo' }
            });
            return res.json(dividaAtualizada);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar status da dívida:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { cliente_id, valor, descricao, status_negativado } = req.body;
            const divida = await prismaClient_1.prisma.divida.findUnique({
                where: { id: Number(id) }
            });
            if (!divida) {
                throw new AppError_1.AppError('Dívida não encontrada', 404);
            }
            const dividaAtualizada = await prismaClient_1.prisma.divida.update({
                where: { id: Number(id) },
                data: {
                    cliente_id: Number(cliente_id),
                    valor: Number(valor),
                    descricao,
                    status_negativado
                }
            });
            await this.atualizarStatusCliente(Number(cliente_id));
            return res.json(dividaAtualizada);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao atualizar dívida:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const divida = await prismaClient_1.prisma.divida.findUnique({ where: { id: Number(id) } });
            if (!divida) {
                return res.status(404).json({ error: 'Dívida não encontrada' });
            }
            res.json(divida);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao buscar dívida' });
        }
    }
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const divida = await prismaClient_1.prisma.divida.findUnique({ where: { id: Number(id) } });
            if (!divida) {
                throw new AppError_1.AppError('Dívida não encontrada', 404);
            }
            await prismaClient_1.prisma.divida.delete({ where: { id: Number(id) } });
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            console.error('Erro ao deletar dívida:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.DividaController = DividaController;
