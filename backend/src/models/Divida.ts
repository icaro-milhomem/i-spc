import { prisma } from '../db';

export interface Divida {
  id: number;
  cliente_id: number;
  nome_devedor: string;
  cpf_cnpj_devedor: string;
  valor: string;
  descricao: string | null;
  data_cadastro: Date;
  protocolo?: string | null;
  empresa?: string | null;
  cnpj_empresa?: string | null;
  status_negativado: boolean;
  tenant_id: number;
  usuario_id: number;
}

export class DividaModel {
  static async criar(
    cliente_id: number,
    nome_devedor: string,
    cpf_cnpj_devedor: string,
    valor: string,
    descricao: string | null,
    protocolo: string | null,
    empresa: string | null,
    cnpj_empresa: string | null,
    tenant_id: number,
    usuario_id: number
  ): Promise<Divida> {
    // @ts-ignore
    const divida = await prisma.divida.create({
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
    return { ...divida, valor: divida.valor.toString() };
  }

  static async buscarPorCliente(cliente_id: number): Promise<Divida[]> {
    const dividas = await prisma.divida.findMany({
      where: { cliente_id }
    });
    return dividas.map(d => ({
      ...d,
      valor: d.valor.toString(),
      data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : ''
    }));
  }
}