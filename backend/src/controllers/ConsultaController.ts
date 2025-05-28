import { Request, Response } from 'express';
import { ConsultaModel, Consulta } from '../models/Consulta';
import { ClienteModel, Cliente } from '../models/Cliente';
import { DividaModel, Divida } from '../models/Divida';

export class ConsultaController {
  static async consultarCPF(req: Request, res: Response) {
    try {
      const { cpf } = req.params;
      
      // Buscar cliente
      const cliente = await ClienteModel.buscarPorCPF(cpf);
      
      // Buscar dívidas se o cliente existir
      let dividas: Divida[] = [];
      if (cliente) {
        dividas = await DividaModel.buscarPorCliente(cliente.id!);
      }
      
      // Preparar resultado
      const resultado = {
        cliente: cliente || null,
        dividas: dividas,
        data_consulta: new Date()
      };
      
      // Registrar consulta
      const consulta: Consulta = {
        cpf_consultado: cpf,
        data_consulta: new Date(),
        resultado: JSON.stringify(resultado)
      };
      
      await ConsultaModel.registrar(consulta);
      
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao consultar CPF' });
    }
  }

  static async buscarHistorico(req: Request, res: Response) {
    try {
      const { cpf } = req.params;
      const consultas = await ConsultaModel.buscarHistorico(cpf);
      res.json(consultas);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar histórico de consultas' });
    }
  }
} 