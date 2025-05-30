"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteModel = void 0;
const db_1 = require("../db");
class ClienteModel {
    static async criar(nome, cpf, email, telefone, endereco) {
        return db_1.prisma.cliente.create({
            data: {
                nome,
                cpf,
                email,
                telefone,
                endereco,
                status: 'ativo'
            }
        });
    }
    static async buscarPorCPF(cpf) {
        return db_1.prisma.cliente.findUnique({
            where: { cpf }
        });
    }
    static async atualizarStatus(cpf, status) {
        return db_1.prisma.cliente.update({
            where: { cpf },
            data: { status }
        });
    }
}
exports.ClienteModel = ClienteModel;
