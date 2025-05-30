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

    // Criar usuário padrão já como admin (idempotente)
    const usuarioPadraoAdmin = await prisma.usuario.upsert({
      where: { email: 'usuario@pspc.com' },
      update: {
        perfil: 'admin',
        papeis: {
          set: [{ id: papelAdmin.id }]
        }
      },
      create: {
        nome: 'Usuário Padrão',
        email: 'usuario@pspc.com',
        senha: await bcrypt.hash('123456', 10),
        perfil: 'admin',
        ativo: true,
        papeis: {
          connect: [{ id: papelAdmin.id }]
        }
      }
    });
    console.log('Usuário padrão admin criado/atualizado:', usuarioPadraoAdmin);

    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });