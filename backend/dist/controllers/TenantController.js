"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantController = void 0;
const prismaClient_1 = require("../database/prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class TenantController {
    static async criar(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || req.user.role !== 'superadmin') {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            const { nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf, admin } = req.body;
            if (!nome || !cnpj || !razao_social || !cep || !endereco || !numero || !bairro || !cidade || !uf || !(admin === null || admin === void 0 ? void 0 : admin.email) || !(admin === null || admin === void 0 ? void 0 : admin.senha)) {
                return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
            }
            const novoTenant = await prismaClient_1.prisma.tenant.create({
                data: { nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf }
            });
            const senhaHash = await bcryptjs_1.default.hash(admin.senha, 10);
            await prismaClient_1.prisma.usuario.create({
                data: {
                    nome: 'Admin',
                    email: admin.email,
                    senha: senhaHash,
                    perfil: 'admin',
                    role: 'admin',
                    tenant_id: novoTenant.id,
                    ativo: true
                }
            });
            res.status(201).json({ message: 'Empresa e admin criados com sucesso!' });
        }
        catch (error) {
            console.error('Erro ao criar tenant:', error);
            res.status(500).json({ error: 'Erro ao criar empresa' });
        }
    }
    static async listar(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || req.user.role !== 'superadmin') {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            const tenants = await prismaClient_1.prisma.tenant.findMany({
                include: {
                    usuarios: {
                        where: { role: 'admin' },
                        select: { email: true }
                    }
                }
            });
            res.json(tenants.map(t => {
                var _a;
                return ({
                    id: t.id,
                    nome: t.nome,
                    cnpj: t.cnpj,
                    razao_social: t.razao_social,
                    cep: t.cep,
                    endereco: t.endereco,
                    numero: t.numero,
                    bairro: t.bairro,
                    cidade: t.cidade,
                    uf: t.uf,
                    email: ((_a = t.usuarios[0]) === null || _a === void 0 ? void 0 : _a.email) || '',
                    created_at: t.createdAt
                });
            }));
        }
        catch (error) {
            console.error('Erro ao listar tenants:', error);
            res.status(500).json({ error: 'Erro ao listar empresas' });
        }
    }
    static async atualizar(req, res) {
        var _a;
        try {
            if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || req.user.role !== 'superadmin') {
                return res.status(403).json({ error: 'Acesso negado' });
            }
            const id = Number(req.params.id);
            const { nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf, email } = req.body;
            const tenant = await prismaClient_1.prisma.tenant.update({
                where: { id },
                data: { nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf }
            });
            if (email) {
                await prismaClient_1.prisma.usuario.updateMany({
                    where: { tenant_id: id, role: 'admin' },
                    data: { email }
                });
            }
            res.json({ message: 'Empresa atualizada com sucesso!', tenant });
        }
        catch (error) {
            console.error('Erro ao atualizar tenant:', error);
            res.status(500).json({ error: 'Erro ao atualizar empresa' });
        }
    }
}
exports.TenantController = TenantController;
