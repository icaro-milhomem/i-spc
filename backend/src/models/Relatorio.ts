import { Cliente } from './Cliente';
import { Divida } from './Divida';
import { Consulta } from './Consulta';

export interface RelatorioInadimplentes {
  totalInadimplentes: number;
  valorTotalDividas: number;
  inadimplentes: Array<{
    cliente: Cliente;
    dividas: Divida[];
    ultimaConsulta?: Consulta;
  }>;
}

export interface RelatorioConsultas {
  totalConsultas: number;
  consultasPorPeriodo: Array<{
    data: Date;
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