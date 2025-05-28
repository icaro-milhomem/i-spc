"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const papelAdmin = await prisma.papel.create({
            data: {
                nome: 'Administrador',
                descricao: 'Papel com todas as permissões'
            }
        });
        const permissoes = await Promise.all([
            prisma.permissao.create({
                data: {
                    codigo: 'USUARIO_CRIAR',
                    descricao: 'Permite criar usuários'
                }
            }),
            prisma.permissao.create({
                data: {
                    codigo: 'USUARIO_EDITAR',
                    descricao: 'Permite editar usuários'
                }
            }),
            prisma.permissao.create({
                data: {
                    codigo: 'USUARIO_DELETAR',
                    descricao: 'Permite deletar usuários'
                }
            })
        ]);
        await prisma.papel.update({
            where: { id: papelAdmin.id },
            data: {
                permissoes: {
                    connect: permissoes.map(p => ({ id: p.id }))
                }
            }
        });
        const senhaHash = await (0, bcryptjs_1.hash)('admin123', 8);
        const usuario = await prisma.usuario.create({
            data: {
                nome: 'Administrador',
                email: 'admin@example.com',
                senha: senhaHash,
                papeis: {
                    connect: [{ id: papelAdmin.id }]
                }
            }
        });
        console.log('Usuário criado com sucesso:', usuario);
    }
    catch (error) {
        console.error('Erro ao criar usuário:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
