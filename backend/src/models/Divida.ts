import { prisma } from '../db';

export interface Divida {
  id: number;
  cliente_id: number;
  valor: number;
  data_vencimento: Date;
  descricao: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  data?: Date;
}

export class DividaModel {
  static async criar(cliente_id: number, valor: number, data_vencimento: Date, descricao?: string): Promise<Divida> {
    return prisma.divida.create({
      data: {
        cliente_id,
        valor,
        data_vencimento,
        descricao,
        status: 'pendente'
      }
    });
  }

  static async buscarPorCliente(cliente_id: number): Promise<Divida[]> {
    return prisma.divida.findMany({
      where: { cliente_id }
    });
  }

  static async atualizarStatus(id: number, status: string): Promise<Divida> {
    return prisma.divida.update({
      where: { id },
      data: { status }
    });
  }
} 