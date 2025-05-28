"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultaModel = void 0;
const db_1 = require("../db");
class ConsultaModel {
    static async registrar(consulta) {
        const { cpf_consultado, data_consulta, resultado } = consulta;
        const query = `
      INSERT INTO consultas (cpf_consultado, data_consulta, resultado)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
        const values = [cpf_consultado, data_consulta, resultado];
        const result = await db_1.db.query(query, values);
        return result.rows[0];
    }
    static async buscarHistorico(cpf) {
        const query = 'SELECT * FROM consultas WHERE cpf_consultado = $1 ORDER BY data_consulta DESC';
        const result = await db_1.db.query(query, [cpf]);
        return result.rows;
    }
}
exports.ConsultaModel = ConsultaModel;
