"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atribuirPapel = atribuirPapel;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function atribuirPapel(email) {
    try {
        const papelUsuario = await prisma.papel.findUnique({
            where: { nome: 'usuario' }
        });
        if (!papelUsuario) {
            console.error('Papel "usuario" não encontrado');
            return;
        }
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });
        if (!usuario) {
            console.error('Usuário não encontrado');
            return;
        }
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                papeis: {
                    connect: [{ id: papelUsuario.id }]
                }
            }
        });
        console.log(`Papel atribuído com sucesso para o usuário ${email}!`);
    }
    catch (error) {
        console.error('Erro:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    const email = process.argv[2];
    if (!email) {
        console.error('Por favor, forneça o email do usuário como argumento');
        process.exit(1);
    }
    atribuirPapel(email);
}
