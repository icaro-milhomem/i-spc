import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando seed do banco de dados...');

    // Criar permissões
    const permissoes = await Promise.all([
      prisma.permissao.create({
        data: {
          codigo: 'gerenciar_usuarios',
          descricao: 'Permite gerenciar usuários do sistema'
        }
      }),
      prisma.permissao.create({
        data: {
          codigo: 'gerenciar_clientes',
          descricao: 'Permite gerenciar clientes'
        }
      }),
      prisma.permissao.create({
        data: {
          codigo: 'gerenciar_dividas',
          descricao: 'Permite gerenciar dívidas'
        }
      })
    ]);

    console.log('Permissões criadas:', permissoes);

    // Criar papel de administrador
    const papelAdmin = await prisma.papel.create({
      data: {
        nome: 'admin',
        descricao: 'Administrador do sistema',
        permissoes: {
          connect: permissoes.map(p => ({ id: p.id }))
        }
      }
    });

    console.log('Papel admin criado:', papelAdmin);

    // Criar usuário admin
    const senhaHash = await bcrypt.hash('123456', 10);
    const usuarioAdmin = await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: 'admin@pspc.com',
        senha: senhaHash,
        perfil: 'ADMIN',
        papeis: {
          connect: [{ id: papelAdmin.id }]
        }
      }
    });

    console.log('Usuário admin criado:', usuarioAdmin);
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