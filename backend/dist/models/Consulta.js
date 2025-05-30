"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultaModel = void 0;
const db_1 = require("../db");
class ConsultaModel {
    static async criar(cliente_id, data, tipo, observacoes) {
        return db_1.prisma.consulta.create({
            data: {
                cliente_id,
                data,
                tipo,
                observacoes
            }
        });
    }
    static async buscarPorCliente(cliente_id) {
        return db_1.prisma.consulta.findMany({
            where: { cliente_id }
        });
    }
    static async buscarPorId(id) {
        return db_1.prisma.consulta.findUnique({
            where: { id }
        });
    }
}
exports.ConsultaModel = ConsultaModel;
