"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DividaModel = void 0;
const db_1 = require("../db");
class DividaModel {
    static async criar(cliente_id, nome_devedor, cpf_cnpj_devedor, valor, descricao, protocolo, empresa, cnpj_empresa, tenant_id, usuario_id) {
        const divida = await db_1.prisma.divida.create({
            data: {
                cliente_id,
                nome_devedor,
                cpf_cnpj_devedor,
                valor: valor,
                descricao,
                data_cadastro: new Date(),
                protocolo,
                empresa,
                cnpj_empresa,
                status_negativado: false,
                tenant_id,
                usuario_id
            }
        });
        return Object.assign(Object.assign({}, divida), { valor: divida.valor.toString() });
    }
    static async buscarPorCliente(cliente_id) {
        const dividas = await db_1.prisma.divida.findMany({
            where: { cliente_id }
        });
        return dividas.map(d => (Object.assign(Object.assign({}, d), { valor: d.valor.toString(), data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : '' })));
    }
}
exports.DividaModel = DividaModel;
