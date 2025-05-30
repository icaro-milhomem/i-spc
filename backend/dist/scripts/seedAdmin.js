"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function seedAdmin() {
    try {
        const adminEmail = 'admin@pspc.com';
        const adminSenha = 'admin123';
        const adminExistente = await db_1.prisma.usuario.findUnique({
            where: { email: adminEmail }
        });
        if (adminExistente) {
            console.log('Usuário admin já existe');
            return;
        }
        const senhaHash = await bcrypt_1.default.hash(adminSenha, 10);
        await db_1.prisma.usuario.create({
            data: {
                nome: 'Administrador',
                email: adminEmail,
                senha: senhaHash,
                perfil: 'admin'
            }
        });
        console.log('Usuário admin criado com sucesso');
    }
    catch (error) {
        console.error('Erro ao criar usuário admin:', error);
    }
    finally {
        await db_1.prisma.$disconnect();
    }
}
seedAdmin();
