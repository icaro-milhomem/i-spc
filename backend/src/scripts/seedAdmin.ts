import { prisma } from '../db';
import bcrypt from 'bcrypt';

async function seedAdmin() {
  try {
    const adminEmail = 'admin@pspc.com';
    const adminSenha = 'admin123';

    // Verifica se o admin já existe
    const adminExistente = await prisma.usuario.findUnique({
      where: { email: adminEmail }
    });

    if (adminExistente) {
      console.log('Usuário admin já existe');
      return;
    }

    // Cria o admin
    const senhaHash = await bcrypt.hash(adminSenha, 10);
    await prisma.usuario.create({
      data: {
        nome: 'Administrador',
        email: adminEmail,
        senha: senhaHash,
        perfil: 'admin'
      }
    });

    console.log('Usuário admin criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin(); 