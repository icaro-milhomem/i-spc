import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function atribuirPapel(email: string) {
  try {
    // Buscar o papel 'usuario'
    const papelUsuario = await prisma.papel.findUnique({
      where: { nome: 'usuario' }
    });

    if (!papelUsuario) {
      console.error('Papel "usuario" não encontrado');
      return;
    }

    // Buscar o usuário pelo email
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      console.error('Usuário não encontrado');
      return;
    }

    // Atribuir o papel ao usuário
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        papeis: {
          connect: [{ id: papelUsuario.id }]
        }
      }
    });

    console.log(`Papel atribuído com sucesso para o usuário ${email}!`);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Se o script for executado diretamente
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Por favor, forneça o email do usuário como argumento');
    process.exit(1);
  }
  atribuirPapel(email);
}

export { atribuirPapel }; 