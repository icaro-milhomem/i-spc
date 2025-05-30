import { prisma } from '../db';

export interface Consulta {
  id: number;
  cliente_id: number;
  data: Date;
  tipo: string;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
  cpf_consultado?: string;
  data_consulta?: Date;
  resultado?: string;
}

export class ConsultaModel {
  static async criar(cliente_id: number, data: Date, tipo: string, observacoes?: string): Promise<Consulta> {
    return prisma.consulta.create({
      data: {
        cliente_id,
        data,
        tipo,
        observacoes
      }
    });
  }

  static async buscarPorCliente(cliente_id: number): Promise<Consulta[]> {
    return prisma.consulta.findMany({
      where: { cliente_id }
    });
  }

  static async buscarPorId(id: number): Promise<Consulta | null> {
    return prisma.consulta.findUnique({
      where: { id }
    });
  }
} 