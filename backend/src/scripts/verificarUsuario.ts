import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email: 'admin@example.com' },
            include: {
                papeis: {
                    include: {
                        permissoes: true
                    }
                }
            }
        });

        console.log('Usuário encontrado:', usuario);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 