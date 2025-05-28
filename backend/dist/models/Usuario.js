"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioModel = void 0;
const db_1 = require("../db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UsuarioModel {
    static async criar(usuario) {
        const { nome, email, senha, perfil, status } = usuario;
        const senhaHash = await bcryptjs_1.default.hash(senha, 10);
        const query = `
      INSERT INTO usuarios (nome, email, senha, perfil, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const values = [nome, email, senhaHash, perfil, status];
        const result = await db_1.db.query(query, values);
        return result.rows[0];
    }
    static async buscarPorEmail(email) {
        const query = 'SELECT * FROM usuarios WHERE email = $1';
        const result = await db_1.db.query(query, [email]);
        return result.rows[0] || null;
    }
    static async buscarPorId(id) {
        const query = 'SELECT * FROM usuarios WHERE id = $1';
        const result = await db_1.db.query(query, [id]);
        return result.rows[0] || null;
    }
    static async atualizar(id, usuario) {
        const { nome, email, senha, perfil, status } = usuario;
        let query = 'UPDATE usuarios SET ';
        const values = [];
        const updates = [];
        if (nome) {
            updates.push(`nome = $${values.length + 1}`);
            values.push(nome);
        }
        if (email) {
            updates.push(`email = $${values.length + 1}`);
            values.push(email);
        }
        if (senha) {
            const senhaHash = await bcryptjs_1.default.hash(senha, 10);
            updates.push(`senha = $${values.length + 1}`);
            values.push(senhaHash);
        }
        if (perfil) {
            updates.push(`perfil = $${values.length + 1}`);
            values.push(perfil);
        }
        if (status) {
            updates.push(`status = $${values.length + 1}`);
            values.push(status);
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        query += updates.join(', ') + ' WHERE id = $' + (values.length + 1) + ' RETURNING *';
        values.push(id);
        const result = await db_1.db.query(query, values);
        return result.rows[0];
    }
    static async deletar(id) {
        const query = 'DELETE FROM usuarios WHERE id = $1';
        await db_1.db.query(query, [id]);
    }
    static async listar() {
        const query = 'SELECT id, nome, email, perfil, status, created_at, updated_at FROM usuarios ORDER BY nome';
        const result = await db_1.db.query(query);
        return result.rows;
    }
}
exports.UsuarioModel = UsuarioModel;
