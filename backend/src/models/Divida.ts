import { db } from '../db';

export interface Divida {
  id?: number;
  cliente_id: number;
  descricao: string;
  valor: number;
  data: Date;
  status: 'pendente' | 'paga' | 'cancelada';
}

export class DividaModel {
  static async criar(divida: Divida): Promise<Divida> {
    const { cliente_id, descricao, valor, data, status } = divida;
    const query = `
      INSERT INTO dividas (cliente_id, descricao, valor, data, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [cliente_id, descricao, valor, data, status];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async buscarPorCliente(cliente_id: number): Promise<Divida[]> {
    const query = 'SELECT * FROM dividas WHERE cliente_id = $1 ORDER BY data DESC';
    const result = await db.query(query, [cliente_id]);
    return result.rows;
  }

  static async atualizarStatus(id: number, status: Divida['status']): Promise<Divida> {
    const query = 'UPDATE dividas SET status = $1 WHERE id = $2 RETURNING *';
    const result = await db.query(query, [status, id]);
    return result.rows[0];
  }
} 