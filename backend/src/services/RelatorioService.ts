import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { Cliente } from '../models/Cliente';
import { Consulta } from '../models/Consulta';
import { RelatorioInadimplentes, RelatorioConsultas, RelatorioDividas, DividaRelatorio } from '../models/Relatorio';

interface InadimplenteRow {
  id: number;
  cpf: string;
  nome: string;
  telefone: string;
  status: string;
  id_divida: number;
  cliente_id: number;
  descricao: string;
  valor: number;
  data_cadastro: Date;
  status_negativado: boolean;
  id_consulta?: number;
  data_consulta?: Date;
  tipo?: string;
  observacoes?: string;
}

interface ConsultaRow {
  id: number;
  cliente_id: number;
  data: string;
  consulta_data: string;
  tipo: string;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  quantidade: string;
}

interface DividaRow {
  id: number;
  cliente_id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status: 'pendente' | 'paga' | 'cancelada';
  total: string;
  valor_total: string;
  count: string;
}

interface InadimplenteRelatorio {
  cliente: Omit<Cliente, 'dividas'>;
  dividas: DividaRelatorio[];
  ultimaConsulta?: Consulta;
}

export class RelatorioService {
  static async getEstatisticas() {
    const totalClientes = await prisma.cliente.count();
    const totalInadimplentes = await prisma.cliente.count({
      where: {
        dividas: {
          some: {
            status_negativado: true
          }
        }
      }
    });
    const consultasHoje = await prisma.consulta.count({
      where: {
        data: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    });

    return {
      totalClientes,
      totalInadimplentes,
      consultasHoje
    };
  }

  static async getConsultasPorPeriodo(dataInicio: Date, dataFim: Date) {
    return prisma.consulta.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      include: {
        cliente: true
      }
    });
  }

  async gerarRelatorioInadimplentes(): Promise<Omit<RelatorioInadimplentes, 'inadimplentes'> & { inadimplentes: InadimplenteRelatorio[] }> {
    const clientes = await prisma.cliente.findMany({
      where: {
        dividas: {
          some: { status_negativado: true }
        }
      },
      include: {
        dividas: true
      }
    });

    const inadimplentes: InadimplenteRelatorio[] = clientes.map(cliente => ({
      cliente: { ...cliente, dividas: undefined } as Omit<Cliente, 'dividas'>,
      dividas: cliente.dividas
        .filter(d => d.status_negativado)
        .map(d => ({
          id: d.id,
          id_cliente: d.cliente_id,
          descricao: d.descricao || '',
          valor: Number(d.valor),
          data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : '',
          status: d.status_negativado ? 'pendente' : 'pago',
          protocolo: d.protocolo || '',
          empresa: d.empresa || '',
          cnpj_empresa: d.cnpj_empresa || ''
        })),
      ultimaConsulta: undefined
    }));

    const valorTotalDividas = inadimplentes.reduce((total, inadimplente) => {
      return total + inadimplente.dividas.reduce((subtotal, divida) => subtotal + divida.valor, 0);
    }, 0);

    return {
      totalInadimplentes: inadimplentes.length,
      valorTotalDividas,
      inadimplentes
    };
  }

  async gerarRelatorioConsultas(dataInicio: Date, dataFim: Date): Promise<RelatorioConsultas> {
    console.log('Gerando relatório de consultas:', { dataInicio, dataFim });

    // Primeiro, vamos buscar todas as consultas no período
    const consultas = await prisma.consulta.findMany({
      where: {
        data: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      orderBy: {
        data: 'desc'
      }
    });

    console.log('Consultas encontradas:', consultas.length);

    // Agora vamos agrupar por dia
    const consultasPorDia = new Map<string, number>();
    consultas.forEach(consulta => {
      const data = consulta.data.toISOString().split('T')[0];
      consultasPorDia.set(data, (consultasPorDia.get(data) || 0) + 1);
    });

    const consultasPorPeriodo = Array.from(consultasPorDia.entries()).map(([data, quantidade]) => ({
      data,
      quantidade
    }));

    console.log('Consultas por período:', consultasPorPeriodo);

    return {
      totalConsultas: consultas.length,
      consultasPorPeriodo,
      consultas: consultas.map(consulta => ({
        id: consulta.id,
        cliente_id: consulta.cliente_id,
        data: consulta.data,
        tipo: consulta.tipo,
        observacoes: consulta.observacoes,
        createdAt: consulta.createdAt,
        updatedAt: consulta.updatedAt
      }))
    };
  }

  async gerarRelatorioDividas(): Promise<Omit<RelatorioDividas, 'dividas'> & { dividas: DividaRelatorio[] }> {
    const dividasDb = await prisma.divida.findMany({
      include: { cliente: true }
    });
    const dividas: DividaRelatorio[] = dividasDb.map((d) => {
      const status: string = d.status_negativado ? 'pago' : 'pendente';
      return {
        id: d.id,
        id_cliente: d.cliente_id,
        descricao: d.descricao || '',
        valor: Number(d.valor),
        data_vencimento: d.data_cadastro ? d.data_cadastro.toISOString() : '',
        status,
        protocolo: d.protocolo || '',
        empresa: d.empresa || '',
        cnpj_empresa: d.cnpj_empresa || ''
      };
    });
    const totalDividas = dividas.length;
    const valorTotal = dividas.reduce((total, d) => total + d.valor, 0);
    const dividasPorStatus = {
      pendente: dividas.filter(d => d.status === 'pendente').length,
      pago: dividas.filter(d => d.status === 'pago').length,
      cancelado: 0
    };
    return {
      totalDividas,
      valorTotal,
      dividasPorStatus,
      dividas
    };
  }

  async buscarTodasConsultasDebug(): Promise<any[]> {
    const consultas = await prisma.consulta.findMany({
      orderBy: { data: 'desc' }
    });
    console.log('DEBUG - Total de consultas encontradas:', consultas.length);
    return consultas;
  }

  async buscarTodosInadimplentesDebug(): Promise<any[]> {
    const inadimplentes = await prisma.cliente.findMany({
      include: { dividas: true }
    });
    console.log('DEBUG - Total de clientes encontrados:', inadimplentes.length);
    return inadimplentes;
  }
}