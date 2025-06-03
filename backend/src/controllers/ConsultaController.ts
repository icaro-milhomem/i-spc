import { Request, Response } from 'express';
import { ClienteModel } from '../models/Cliente';
import { ConsultaModel } from '../models/Consulta';
import { DividaModel } from '../models/Divida';

export class ConsultaController {
  static async registrar(req: Request, res: Response) {
    try {
      const { cpf, tipo, observacoes } = req.body;

      // Busca o cliente pelo CPF
      const cliente = await ClienteModel.buscarPorCPF(cpf);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      // Cria a consulta
      const consulta = await ConsultaModel.criar(
        cliente.id,
        new Date(),
        tipo,
        observacoes
      );

      res.status(201).json(consulta);
    } catch (error) {
      console.error('Erro ao registrar consulta:', error);
      res.status(500).json({ error: 'Erro ao registrar consulta' });
    }
  }

  static async buscarHistorico(req: Request, res: Response) {
    try {
      const { cpf } = req.params;

      // Busca o cliente pelo CPF
      const cliente = await ClienteModel.buscarPorCPF(cpf);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      // Busca as consultas do cliente
      const consultas = await ConsultaModel.buscarPorCliente(cliente.id);
      res.json(consultas);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  }

  static async consultarCPF(req: Request, res: Response) {
    try {
      const { cpf } = req.params;

      // Busca o cliente pelo CPF
      const cliente = await ClienteModel.buscarPorCPF(cpf);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      // Busca as dívidas do cliente
      let dividas = await DividaModel.buscarPorCliente(cliente.id);
      dividas = dividas.map(d => ({
        ...d,
        data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : ''
      }));

      // Registra a consulta
      await ConsultaModel.criar(
        cliente.id,
        new Date(),
        'consulta_cpf',
        'Consulta realizada via API'
      );

      res.json({
        cliente,
        dividas,
        data_consulta: new Date()
      });
    } catch (error) {
      console.error('Erro ao consultar CPF:', error);
      res.status(500).json({ error: 'Erro ao consultar CPF' });
    }
  }
} 