import { db } from '../db';

export interface Consulta {
  id?: number;
  cpf_consultado: string;
  data_consulta: Date;
  resultado: string;
}

export class ConsultaModel {
  static async registrar(consulta: Consulta): Promise<Consulta> {
    const { cpf_consultado, data_consulta, resultado } = consulta;
    const query = `
      INSERT INTO consultas (cpf_consultado, data_consulta, resultado)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [cpf_consultado, data_consulta, resultado];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async buscarHistorico(cpf: string): Promise<Consulta[]> {
    const query = 'SELECT * FROM consultas WHERE cpf_consultado = $1 ORDER BY data_consulta DESC';
    const result = await db.query(query, [cpf]);
    return result.rows;
  }
} 