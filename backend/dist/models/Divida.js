"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DividaModel = void 0;
const db_1 = require("../db");
class DividaModel {
    static async criar(divida) {
        const { cliente_id, descricao, valor, data, status } = divida;
        const query = `
      INSERT INTO dividas (cliente_id, descricao, valor, data, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [cliente_id, descricao, valor, data, status];
        const result = await db_1.db.query(query, values);
        return result.rows[0];
    }
    static async buscarPorCliente(cliente_id) {
        const query = 'SELECT * FROM dividas WHERE cliente_id = $1 ORDER BY data DESC';
        const result = await db_1.db.query(query, [cliente_id]);
        return result.rows;
    }
    static async atualizarStatus(id, status) {
        const query = 'UPDATE dividas SET status = $1 WHERE id = $2 RETURNING *';
        const result = await db_1.db.query(query, [status, id]);
        return result.rows[0];
    }
}
exports.DividaModel = DividaModel;
