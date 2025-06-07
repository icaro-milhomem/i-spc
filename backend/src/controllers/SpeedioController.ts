import { Request, Response } from 'express';
import fetch from 'node-fetch';

export class SpeedioController {
  static async buscarCnpj(req: Request, res: Response) {
    const { cnpj } = req.params;
    // Remove qualquer caractere não numérico do CNPJ
    const cnpjLimpo = String(cnpj).replace(/\D/g, '');
    if (!cnpjLimpo || !/^[0-9]{14}$/.test(cnpjLimpo)) {
      return res.status(400).json({ error: 'CNPJ inválido' });
    }
    try {
      // Consulta primeiro na ReceitaWS
      let response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`);
      let data = await response.json();
      console.log('Resposta ReceitaWS:', data);
      if (
        data.status === 'ERROR' ||
        (typeof data === 'object' && data !== null && Object.keys(data).length === 0) ||
        (Array.isArray(data) && data.length === 0) ||
        (typeof data === 'string' && data.trim() === '')
      ) {
        // Se não encontrar na ReceitaWS, tenta na Speedio
        response = await fetch(`https://api-publica.speedio.com.br/buscarcnpj?cnpj=${cnpjLimpo}`);
        data = await response.json();
        console.log('Resposta Speedio:', data);
        if (
          data.error ||
          (typeof data === 'object' && data !== null && Object.keys(data).length === 0) ||
          (Array.isArray(data) && data.length === 0) ||
          (typeof data === 'string' && data.trim() === '')
        ) {
          return res.status(404).json({ error: 'CNPJ não encontrado em nenhuma base pública' });
        }
      }
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao consultar CNPJ' });
    }
  }
}
