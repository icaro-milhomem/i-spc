"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultaController = void 0;
const Consulta_1 = require("../models/Consulta");
const Cliente_1 = require("../models/Cliente");
const Divida_1 = require("../models/Divida");
class ConsultaController {
    static async registrar(req, res) {
        try {
            const { cpf, tipo, observacoes } = req.body;
            const cliente = await Cliente_1.ClienteModel.buscarPorCPF(cpf);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }
            const consulta = await Consulta_1.ConsultaModel.criar(cliente.id, new Date(), tipo, observacoes);
            res.status(201).json(consulta);
        }
        catch (error) {
            console.error('Erro ao registrar consulta:', error);
            res.status(500).json({ error: 'Erro ao registrar consulta' });
        }
    }
    static async buscarHistorico(req, res) {
        try {
            const { cpf } = req.params;
            const cliente = await Cliente_1.ClienteModel.buscarPorCPF(cpf);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }
            const consultas = await Consulta_1.ConsultaModel.buscarPorCliente(cliente.id);
            res.json(consultas);
        }
        catch (error) {
            console.error('Erro ao buscar histórico:', error);
            res.status(500).json({ error: 'Erro ao buscar histórico' });
        }
    }
    static async consultarCPF(req, res) {
        try {
            const { cpf } = req.params;
            const cliente = await Cliente_1.ClienteModel.buscarPorCPF(cpf);
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }
            const dividas = await Divida_1.DividaModel.buscarPorCliente(cliente.id);
            await Consulta_1.ConsultaModel.criar(cliente.id, new Date(), 'consulta_cpf', 'Consulta realizada via API');
            res.json({
                cliente,
                dividas,
                data_consulta: new Date()
            });
        }
        catch (error) {
            console.error('Erro ao consultar CPF:', error);
            res.status(500).json({ error: 'Erro ao consultar CPF' });
        }
    }
}
exports.ConsultaController = ConsultaController;
