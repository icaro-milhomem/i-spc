import { prisma } from '../db';
import { RelatorioInadimplentes, RelatorioConsultas, RelatorioDividas } from '../models/Relatorio';
import { Cliente } from '../models/Cliente';
import { Divida } from '../models/Divida';
import { Consulta } from '../models/Consulta';
import { Prisma } from '@prisma/client';

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
  data_vencimento: Date;
  divida_status: string;
  id_consulta?: number;
  data_consulta?: Date;
  tipo?: string;
  observacoes?: string;
}

interface ConsultaRow {
  id: number;
  cpf_consultado: string;
  data_consulta: string;
  resultado: string;
  data: string;
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

export class RelatorioService {
  static async getEstatisticas() {
    const totalClientes = await prisma.cliente.count();
    const totalInadimplentes = await prisma.cliente.count({
      where: {
        dividas: {
          some: {
            status: 'pendente'
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

  async gerarRelatorioInadimplentes(): Promise<RelatorioInadimplentes> {
    const query = Prisma.sql`
      WITH inadimplentes AS (
        SELECT DISTINCT
          c.id,
          c.cpf,
          c.nome,
          c.telefone,
          c.status,
          d.id as id_divida,
          d.cliente_id,
          d.descricao,
          d.valor,
          d.data_vencimento,
          d.status as divida_status,
          co.id as id_consulta,
          co.data as data_consulta,
          co.tipo,
          co.observacoes
        FROM clientes c
        JOIN dividas d ON c.id = d.cliente_id
        LEFT JOIN consultas co ON c.id = co.cliente_id
        WHERE d.status = 'pendente'
        ORDER BY d.data_vencimento ASC
      )
      SELECT * FROM inadimplentes
    `;

    const result = await prisma.$queryRaw<InadimplenteRow[]>(query);
    
    const inadimplentes = result.reduce((acc, row) => {
      const existingCliente = acc.find(c => c.cliente.id === row.id);
      
      if (existingCliente) {
        existingCliente.dividas.push({
          id: row.id_divida,
          cliente_id: row.cliente_id,
          valor: row.valor,
          data_vencimento: row.data_vencimento,
          descricao: row.descricao,
          status: row.divida_status,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        acc.push({
          cliente: {
            id: row.id,
            cpf: row.cpf,
            nome: row.nome,
            telefone: row.telefone,
            status: row.status,
            email: '',
            endereco: '',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          dividas: [{
            id: row.id_divida,
            cliente_id: row.cliente_id,
            valor: row.valor,
            data_vencimento: row.data_vencimento,
            descricao: row.descricao,
            status: row.divida_status,
            createdAt: new Date(),
            updatedAt: new Date()
          }],
          ultimaConsulta: row.id_consulta ? {
            id: row.id_consulta,
            cliente_id: row.id,
            data: row.data_consulta || new Date(),
            tipo: row.tipo || '',
            observacoes: row.observacoes || null,
            createdAt: new Date(),
            updatedAt: new Date()
          } : undefined
        });
      }
      
      return acc;
    }, [] as Array<{
      cliente: Cliente;
      dividas: Divida[];
      ultimaConsulta?: Consulta;
    }>);

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
    const query = Prisma.sql`
      WITH consultas_por_dia AS (
        SELECT 
          DATE(data) as data,
          COUNT(*) as quantidade
        FROM consultas
        WHERE data >= ${dataInicio.toISOString()} AND data <= ${dataFim.toISOString()}
        GROUP BY DATE(data)
      )
      SELECT 
        cpd.*,
        c.*
      FROM consultas_por_dia cpd
      LEFT JOIN consultas c ON DATE(c.data) = cpd.data
      ORDER BY c.data DESC
    `;

    const result = await prisma.$queryRaw<ConsultaRow[]>(query);
    
    const consultasPorPeriodo = result
      .filter((row, index, self) => 
        index === self.findIndex(r => r.data === row.data)
      )
      .map((row: ConsultaRow) => ({
        data: new Date(row.data),
        quantidade: parseInt(row.quantidade)
      }));

    return {
      totalConsultas: result.length || 0,
      consultasPorPeriodo,
      consultas: result
        .filter(row => row.id)
        .map((row: ConsultaRow) => ({
          id: row.id,
          cliente_id: 0, // Será preenchido posteriormente
          data: new Date(row.data_consulta),
          tipo: 'consulta_cpf',
          observacoes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          cpf_consultado: row.cpf_consultado,
          data_consulta: new Date(row.data_consulta),
          resultado: row.resultado
        }))
    };
  }

  async gerarRelatorioDividas(): Promise<RelatorioDividas> {
    const query = Prisma.sql`
      WITH dividas_por_status AS (
        SELECT 
          status,
          COUNT(*) as total,
          SUM(valor) as valor_total
        FROM dividas
        GROUP BY status
      )
      SELECT 
        d.*,
        dps.total,
        dps.valor_total,
        COUNT(*) OVER() as count
      FROM dividas d
      JOIN dividas_por_status dps ON d.status = dps.status
      ORDER BY d.data_vencimento DESC
    `;

    const result = await prisma.$queryRaw<DividaRow[]>(query);
    
    const dividasPorStatus = {
      pendente: 0,
      pago: 0,
      cancelado: 0
    };

    result.forEach(row => {
      if (row.status === 'pendente') dividasPorStatus.pendente++;
      else if (row.status === 'paga') dividasPorStatus.pago++;
      else if (row.status === 'cancelada') dividasPorStatus.cancelado++;
    });

    return {
      totalDividas: result.length || 0,
      valorTotal: result.reduce((total, row) => total + row.valor, 0),
      dividasPorStatus,
      dividas: result.map(row => ({
        id: row.id,
        cliente_id: row.cliente_id,
        valor: row.valor,
        data_vencimento: new Date(row.data_vencimento),
        descricao: row.descricao,
        status: row.status,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    };
  }
} 