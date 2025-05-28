"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultaController = void 0;
const Consulta_1 = require("../models/Consulta");
const Cliente_1 = require("../models/Cliente");
const Divida_1 = require("../models/Divida");
class ConsultaController {
    static async consultarCPF(req, res) {
        try {
            const { cpf } = req.params;
            const cliente = await Cliente_1.ClienteModel.buscarPorCPF(cpf);
            let dividas = [];
            if (cliente) {
                dividas = await Divida_1.DividaModel.buscarPorCliente(cliente.id);
            }
            const resultado = {
                cliente: cliente || null,
                dividas: dividas,
                data_consulta: new Date()
            };
            const consulta = {
                cpf_consultado: cpf,
                data_consulta: new Date(),
                resultado: JSON.stringify(resultado)
            };
            await Consulta_1.ConsultaModel.registrar(consulta);
            res.json(resultado);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao consultar CPF' });
        }
    }
    static async buscarHistorico(req, res) {
        try {
            const { cpf } = req.params;
            const consultas = await Consulta_1.ConsultaModel.buscarHistorico(cpf);
            res.json(consultas);
        }
        catch (error) {
            res.status(500).json({ error: 'Erro ao buscar histórico de consultas' });
        }
    }
}
exports.ConsultaController = ConsultaController;
