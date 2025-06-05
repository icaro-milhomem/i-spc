import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { prisma } from '../database/prismaClient';
import { JwtPayload } from '../middleware/auth';

export class TenantController {
  static async criar(req: Request, res: Response) {
    try {
      const usuario = req.user as JwtPayload;
      if (!usuario || usuario.role !== 'superadmin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      const { nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf, admin } = req.body;
      if (!nome || !cnpj || !razao_social || !cep || !endereco || !numero || !bairro || !cidade || !uf || !admin?.email || !admin?.senha) {
        return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
      }

      // Buscar o papel de admin
      const papelAdmin = await prisma.papel.findUnique({
        where: { nome: 'admin' },
        include: {
          permissoes: true
        }
      });

      if (!papelAdmin) {
        return res.status(500).json({ error: 'Papel de administrador não encontrado' });
      }

      // Cria o tenant
      const novoTenant = await prisma.tenant.create({
        data: { nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf }
      });

      // Cria o admin vinculado ao tenant com o papel de admin
      const senhaHash = await bcrypt.hash(admin.senha, 10);
      await prisma.usuario.create({
        data: {
          nome: 'Admin',
          email: admin.email,
          senha: senhaHash,
          perfil: 'admin',
          role: 'admin',
          tenant_id: novoTenant.id,
          ativo: true,
          papeis: {
            connect: [{ id: papelAdmin.id }]
          }
        },
        include: {
          papeis: {
            include: {
              permissoes: true
            }
          }
        }
      });

      res.status(201).json({ message: 'Empresa e admin criados com sucesso!' });
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      res.status(500).json({ error: 'Erro ao criar empresa' });
    }
  }

  static async listar(req: Request, res: Response) {
    try {
      const usuario = req.user as JwtPayload;
      if (!usuario || usuario.role !== 'superadmin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      const tenants = await prisma.tenant.findMany({
        include: {
          usuarios: {
            where: { role: 'admin' },
            select: { email: true }
          }
        }
      });
      res.json(tenants.map(t => ({
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
        email: t.usuarios[0]?.email || '',
        created_at: t.createdAt
      })));
    } catch (error) {
      console.error('Erro ao listar tenants:', error);
      res.status(500).json({ error: 'Erro ao listar empresas' });
    }
  }

  static async atualizar(req: Request, res: Response) {
    try {
      const usuario = req.user as JwtPayload;
      if (!usuario || usuario.role !== 'superadmin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      const id = Number(req.params.id);
      const {
        nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf, email
      } = req.body;

      // Atualiza os dados do tenant
      const tenant = await prisma.tenant.update({
        where: { id },
        data: { nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf }
      });

      // Atualiza o e-mail do admin, se enviado
      if (email) {
        await prisma.usuario.updateMany({
          where: { tenant_id: id, role: 'admin' },
          data: { email }
        });
      }

      res.json({ message: 'Empresa atualizada com sucesso!', tenant });
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      res.status(500).json({ error: 'Erro ao atualizar empresa' });
    }
  }

  static async deletar(req: Request, res: Response) {
    try {
      const usuario = req.user as JwtPayload;
      if (!usuario || usuario.role !== 'superadmin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      const id = Number(req.params.id);
      // Remove todos os usuários vinculados ao tenant
      await prisma.usuario.deleteMany({ where: { tenant_id: id } });
      // Remove o tenant
      await prisma.tenant.delete({ where: { id } });
      res.json({ message: 'Empresa excluída com sucesso!' });
    } catch (error) {
      console.error('Erro ao excluir tenant:', error);
      res.status(500).json({ error: 'Erro ao excluir empresa' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf, email, senha } = req.body;
      if (!nome || !cnpj || !razao_social || !cep || !endereco || !numero || !bairro || !cidade || !uf || !email || !senha) {
        return res.status(400).json({ error: 'Dados obrigatórios ausentes' });
      }

      // Buscar o papel de admin
      const papelAdmin = await prisma.papel.findUnique({
        where: { nome: 'admin' },
        include: { permissoes: true }
      });
      if (!papelAdmin) {
        return res.status(500).json({ error: 'Papel de administrador não encontrado' });
      }

      // Cria o tenant
      const novoTenant = await prisma.tenant.create({
        data: { nome, cnpj, razao_social, cep, endereco, numero, bairro, cidade, uf }
      });

      // Cria o admin vinculado ao tenant com o papel de admin
      const senhaHash = await bcrypt.hash(senha, 10);
      await prisma.usuario.create({
        data: {
          nome: 'Admin',
          email,
          senha: senhaHash,
          perfil: 'admin',
          role: 'admin',
          tenant_id: novoTenant.id,
          ativo: true,
          papeis: {
            connect: [{ id: papelAdmin.id }]
          }
        },
        include: {
          papeis: {
            include: {
              permissoes: true
            }
          }
        }
      });

      res.status(201).json({ message: 'Empresa e admin criados com sucesso!' });
    } catch (error) {
      console.error('Erro ao registrar tenant:', error);
      res.status(500).json({ error: 'Erro ao registrar empresa' });
    }
  }
}