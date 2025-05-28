"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteModel = void 0;
const db_1 = require("../db");
class ClienteModel {
    static async criar(cliente) {
        const { cpf, nome, telefone, status } = cliente;
        const query = `
      INSERT INTO clientes (cpf, nome, telefone, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const values = [cpf, nome, telefone, status];
        const result = await db_1.db.query(query, values);
        return result.rows[0];
    }
    static async buscarPorCPF(cpf) {
        const query = 'SELECT * FROM clientes WHERE cpf = $1';
        const result = await db_1.db.query(query, [cpf]);
        return result.rows[0] || null;
    }
    static async atualizarStatus(cpf, status) {
        const query = 'UPDATE clientes SET status = $1 WHERE cpf = $2 RETURNING *';
        const result = await db_1.db.query(query, [status, cpf]);
        return result.rows[0];
    }
}
exports.ClienteModel = ClienteModel;
