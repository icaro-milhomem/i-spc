"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function seedAdmin() {
    const email = 'admin@pspc.com';
    const senha = '123456';
    const nome = 'Administrador';
    const perfil = 'admin';
    const status = 'ativo';
    const userExists = await db_1.db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
        console.log('Usuário admin já existe.');
        process.exit(0);
    }
    const senhaHash = await bcryptjs_1.default.hash(senha, 10);
    await db_1.db.query('INSERT INTO usuarios (nome, email, senha, perfil, status) VALUES ($1, $2, $3, $4, $5)', [nome, email, senhaHash, perfil, status]);
    console.log('Usuário admin criado com sucesso!');
    process.exit(0);
}
seedAdmin().catch((err) => {
    console.error('Erro ao criar admin:', err);
    process.exit(1);
});
