import { prisma } from '../database/prismaClient';

async function promoverParaAdmin(email: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    console.error('Usuário não encontrado:', email);
    process.exit(1);
  }
  await prisma.usuario.update({
    where: { email },
    data: { perfil: 'ADMIN' },
  });
  console.log(`Usuário ${email} promovido para ADMIN com sucesso!`);
  process.exit(0);
}

// Use: npm run ts-node src/scripts/promoverParaAdmin.ts email@dominio.com
const email = process.argv[2];
if (!email) {
  console.error('Informe o e-mail do usuário que deseja promover.');
  process.exit(1);
}
promoverParaAdmin(email);
