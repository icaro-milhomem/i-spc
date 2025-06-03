import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando seed do banco de dados...');

    // Criar permissões (idempotente)
    const permissoes = await Promise.all([
      prisma.permissao.upsert({
        where: { codigo: 'gerenciar_usuarios' },
        update: {},
        create: {
          codigo: 'gerenciar_usuarios',
          descricao: 'Permite gerenciar usuários do sistema'
        }
      }),
      prisma.permissao.upsert({
        where: { codigo: 'gerenciar_clientes' },
        update: {},
        create: {
          codigo: 'gerenciar_clientes',
          descricao: 'Permite gerenciar clientes'
        }
      }),
      prisma.permissao.upsert({
        where: { codigo: 'gerenciar_dividas' },
        update: {},
        create: {
          codigo: 'gerenciar_dividas',
          descricao: 'Permite gerenciar dívidas'
        }
      }),
      prisma.permissao.upsert({
        where: { codigo: 'acessar_relatorios' },
        update: {},
        create: {
          codigo: 'acessar_relatorios',
          descricao: 'Permite acessar relatórios do sistema'
        }
      })
    ]);

    console.log('Permissões criadas:', permissoes);

    // Criar papel de administrador (idempotente)
    const papelAdmin = await prisma.papel.upsert({
      where: { nome: 'admin' },
      update: {
        permissoes: {
          set: permissoes.map(p => ({ id: p.id }))
        }
      },
      create: {
        nome: 'admin',
        descricao: 'Administrador do sistema',
        permissoes: {
          connect: permissoes.map(p => ({ id: p.id }))
        }
      }
    });

    console.log('Papel admin criado:', papelAdmin);

    // Criar papel de usuário comum (idempotente)
    const papelUsuario = await prisma.papel.upsert({
      where: { nome: 'usuario' },
      update: {
        permissoes: {
          set: permissoes.filter(p => p.codigo === 'acessar_relatorios').map(p => ({ id: p.id }))
        }
      },
      create: {
        nome: 'usuario',
        descricao: 'Usuário comum do sistema',
        permissoes: {
          connect: permissoes.filter(p => p.codigo === 'acessar_relatorios').map(p => ({ id: p.id }))
        }
      }
    });

    console.log('Papel usuário criado:', papelUsuario);

    // Criar usuário superadmin (idempotente)
    const usuarioSuperAdmin = await prisma.usuario.upsert({
      where: { email: 'super@pspc.com' },
      update: {
        perfil: 'admin',
        papeis: {
          set: [{ id: papelAdmin.id }]
        },
        role: 'superadmin'
      },
      create: {
        nome: 'Super Admin',
        email: 'super@pspc.com',
        senha: await bcrypt.hash('super123', 10),
        perfil: 'admin',
        ativo: true,
        role: 'superadmin',
        papeis: {
          connect: [{ id: papelAdmin.id }]
        }
      }
    });
    console.log('Usuário superadmin criado/atualizado:', usuarioSuperAdmin);

    // Criar um tenant de exemplo
    const tenantExemplo = await prisma.tenant.upsert({
      where: { cnpj: '12345678000199' },
      update: {},
      create: {
        nome: 'Empresa Exemplo',
        cnpj: '12345678000199',
        razao_social: 'Empresa Exemplo LTDA',
        cep: '12345-678',
        endereco: 'Rua Exemplo',
        numero: '100',
        bairro: 'Centro',
        cidade: 'Cidade Exemplo',
        uf: 'EX'
      }
    });
    console.log('Tenant de exemplo criado:', tenantExemplo);

    // Criar um cliente vinculado ao tenant de exemplo
    const clienteExemplo = await prisma.cliente.upsert({
      where: { cpf: '12345678900' },
      update: {},
      create: {
        nome: 'Cliente Exemplo',
        cpf: '12345678900',
        email: 'cliente@exemplo.com',
        telefone: '11999999999',
        endereco: 'Rua do Cliente',
        status: 'ativo',
        tenant_id: tenantExemplo.id
      }
    });
    console.log('Cliente de exemplo criado:', clienteExemplo);

    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });