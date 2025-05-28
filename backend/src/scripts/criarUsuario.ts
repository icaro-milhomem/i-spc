import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        // Criar papel de administrador
        const papelAdmin = await prisma.papel.create({
            data: {
                nome: 'Administrador',
                descricao: 'Papel com todas as permissões'
            }
        });

        // Criar permissões básicas
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

        // Conectar permissões ao papel
        await prisma.papel.update({
            where: { id: papelAdmin.id },
            data: {
                permissoes: {
                    connect: permissoes.map(p => ({ id: p.id }))
                }
            }
        });

        // Criar usuário admin
        const senhaHash = await hash('admin123', 8);
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
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 