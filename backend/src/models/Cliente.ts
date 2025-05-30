import { prisma } from '../db';

export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ClienteModel {
  static async criar(nome: string, cpf: string, email?: string, telefone?: string, endereco?: string): Promise<Cliente> {
    return prisma.cliente.create({
      data: {
        nome,
        cpf,
        email,
        telefone,
        endereco,
        status: 'ativo'
      }
    });
  }

  static async buscarPorCPF(cpf: string): Promise<Cliente | null> {
    return prisma.cliente.findUnique({
      where: { cpf }
    });
  }

  static async atualizarStatus(cpf: string, status: string): Promise<Cliente> {
    return prisma.cliente.update({
      where: { cpf },
      data: { status }
    });
  }
} 