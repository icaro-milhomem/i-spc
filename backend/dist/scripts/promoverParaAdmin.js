"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prismaClient_1 = require("../database/prismaClient");
async function promoverParaAdmin(email) {
    const usuario = await prismaClient_1.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
        console.error('Usuário não encontrado:', email);
        process.exit(1);
    }
    await prismaClient_1.prisma.usuario.update({
        where: { email },
        data: { perfil: 'ADMIN' },
    });
    console.log(`Usuário ${email} promovido para ADMIN com sucesso!`);
    process.exit(0);
}
const email = process.argv[2];
if (!email) {
    console.error('Informe o e-mail do usuário que deseja promover.');
    process.exit(1);
}
promoverParaAdmin(email);
