import bcrypt from 'bcrypt';
import { prisma } from '../db';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  perfil: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UsuarioModel {
  static async criar(nome: string, email: string, senha: string, perfil: string = 'usuario'): Promise<Usuario> {
    const senhaHash = await bcrypt.hash(senha, 10);
    return prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        perfil
      }
    });
  }

  static async buscarPorEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { email }
    });
  }

  static async buscarPorId(id: number): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id }
    });
  }

  static async atualizar(id: number, dados: Partial<Usuario>): Promise<Usuario> {
    if (dados.senha) {
      dados.senha = await bcrypt.hash(dados.senha, 10);
    }
    return prisma.usuario.update({
      where: { id },
      data: dados
    });
  }

  static async deletar(id: number): Promise<void> {
    await prisma.usuario.delete({
      where: { id }
    });
  }

  static async listar(): Promise<Usuario[]> {
    return prisma.usuario.findMany();
  }
} 