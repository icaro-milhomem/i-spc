import { db } from '../db';
import bcrypt from 'bcryptjs';

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  perfil: 'admin' | 'operador';
  status: 'ativo' | 'inativo';
  created_at?: Date;
  updated_at?: Date;
}

export class UsuarioModel {
  static async criar(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario> {
    const { nome, email, senha, perfil, status } = usuario;
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const query = `
      INSERT INTO usuarios (nome, email, senha, perfil, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [nome, email, senhaHash, perfil, status];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async buscarPorEmail(email: string): Promise<Usuario | null> {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  static async buscarPorId(id: number): Promise<Usuario | null> {
    const query = 'SELECT * FROM usuarios WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  static async atualizar(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const { nome, email, senha, perfil, status } = usuario;
    
    let query = 'UPDATE usuarios SET ';
    const values: any[] = [];
    const updates: string[] = [];
    
    if (nome) {
      updates.push(`nome = $${values.length + 1}`);
      values.push(nome);
    }
    
    if (email) {
      updates.push(`email = $${values.length + 1}`);
      values.push(email);
    }
    
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
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
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async deletar(id: number): Promise<void> {
    const query = 'DELETE FROM usuarios WHERE id = $1';
    await db.query(query, [id]);
  }

  static async listar(): Promise<Usuario[]> {
    const query = 'SELECT id, nome, email, perfil, status, created_at, updated_at FROM usuarios ORDER BY nome';
    const result = await db.query(query);
    return result.rows;
  }
} 