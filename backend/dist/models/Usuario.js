"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsuarioModel = void 0;
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UsuarioModel {
    static async criar(nome, email, senha, perfil = 'usuario') {
        const senhaHash = await bcrypt_1.default.hash(senha, 10);
        return db_1.prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaHash,
                perfil
            }
        });
    }
    static async buscarPorEmail(email) {
        return db_1.prisma.usuario.findUnique({
            where: { email }
        });
    }
    static async buscarPorId(id) {
        return db_1.prisma.usuario.findUnique({
            where: { id }
        });
    }
    static async atualizar(id, dados) {
        if (dados.senha) {
            dados.senha = await bcrypt_1.default.hash(dados.senha, 10);
        }
        return db_1.prisma.usuario.update({
            where: { id },
            data: dados
        });
    }
    static async deletar(id) {
        await db_1.prisma.usuario.delete({
            where: { id }
        });
    }
    static async listar() {
        return db_1.prisma.usuario.findMany();
    }
}
exports.UsuarioModel = UsuarioModel;
