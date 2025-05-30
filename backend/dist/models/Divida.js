"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DividaModel = void 0;
const db_1 = require("../db");
class DividaModel {
    static async criar(cliente_id, valor, data_vencimento, descricao) {
        return db_1.prisma.divida.create({
            data: {
                cliente_id,
                valor,
                data_vencimento,
                descricao,
                status: 'pendente'
            }
        });
    }
    static async buscarPorCliente(cliente_id) {
        return db_1.prisma.divida.findMany({
            where: { cliente_id }
        });
    }
    static async atualizarStatus(id, status) {
        return db_1.prisma.divida.update({
            where: { id },
            data: { status }
        });
    }
}
exports.DividaModel = DividaModel;
