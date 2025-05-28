import { db } from '../db';

export interface Cliente {
  id?: number;
  cpf: string;
  nome: string;
  telefone: string;
  status: 'ativo' | 'inadimplente' | 'bloqueado';
}

export class ClienteModel {
  static async criar(cliente: Cliente): Promise<Cliente> {
    const { cpf, nome, telefone, status } = cliente;
    const query = `
      INSERT INTO clientes (cpf, nome, telefone, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [cpf, nome, telefone, status];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async buscarPorCPF(cpf: string): Promise<Cliente | null> {
    const query = 'SELECT * FROM clientes WHERE cpf = $1';
    const result = await db.query(query, [cpf]);
    return result.rows[0] || null;
  }

  static async atualizarStatus(cpf: string, status: Cliente['status']): Promise<Cliente> {
    const query = 'UPDATE clientes SET status = $1 WHERE cpf = $2 RETURNING *';
    const result = await db.query(query, [status, cpf]);
    return result.rows[0];
  }
} 