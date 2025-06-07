import { Cliente } from './Cliente';
import { Consulta } from './Consulta';
import { Divida } from './Divida';

export interface RelatorioInadimplentes {
  totalInadimplentes: number;
  valorTotalDividas: number;
  inadimplentes: Array<{
    cliente: Cliente;
    dividas: DividaRelatorio[];
    ultimaConsulta?: Consulta;
  }>;
}

export interface RelatorioConsultas {
  totalConsultas: number;
  consultasPorPeriodo: Array<{
    data: string;
    quantidade: number;
  }>;
  consultas: Consulta[];
}

export interface RelatorioDividas {
  totalDividas: number;
  valorTotal: number;
  dividasPorStatus: {
    pendente: number;
    pago: number;
    cancelado: number;
  };
  dividas: Divida[];
}

// Tipo único para dívidas em relatórios/exports
export interface DividaRelatorio {
  id: number;
  id_cliente: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: string;
  protocolo?: string | null;
  empresa?: string | null;
  cnpj_empresa?: string | null;
}