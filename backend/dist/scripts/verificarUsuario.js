"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
