import { db } from '../db';
import { RelatorioInadimplentes, RelatorioConsultas, RelatorioDividas } from '../models/Relatorio';
import { Cliente } from '../models/Cliente';
import { Divida } from '../models/Divida';
import { Consulta } from '../models/Consulta';

interface InadimplenteRow {
  id: number;
  cpf: string;
  nome: string;
  telefone: string;
  status: 'ativo' | 'inadimplente' | 'bloqueado';
  id_divida: number;
  cliente_id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  divida_status: 'pendente' | 'paga' | 'cancelada';
  id_consulta?: number;
  cpf_consultado?: string;
  data_consulta?: string;
  resultado?: string;
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
  async gerarRelatorioInadimplentes(): Promise<RelatorioInadimplentes> {
    const query = `
      WITH ultima_consulta AS (
        SELECT DISTINCT ON (cpf_consultado) *
        FROM consultas
        ORDER BY cpf_consultado, data_consulta DESC
      )
      SELECT 
        c.*,
        d.id as id_divida,
        d.cliente_id,
        d.descricao,
        d.valor,
        d.data_vencimento,
        d.status as divida_status,
        uc.id as id_consulta,
        uc.cpf_consultado,
        uc.data_consulta,
        uc.resultado
      FROM clientes c
      INNER JOIN dividas d ON c.id = d.cliente_id
      LEFT JOIN ultima_consulta uc ON c.cpf = uc.cpf_consultado
      WHERE d.status = 'pendente'
      ORDER BY d.data_vencimento DESC
    `;

    const result = await db.query<InadimplenteRow>(query);
    
    // Agrupa as dívidas por cliente
    const inadimplentesMap = new Map<number, any>();
    
    result.rows.forEach((row: InadimplenteRow) => {
      if (!inadimplentesMap.has(row.id)) {
        inadimplentesMap.set(row.id, {
          cliente: {
            id: row.id,
            cpf: row.cpf,
            nome: row.nome,
            telefone: row.telefone,
            status: row.status
          },
          dividas: [],
          ultimaConsulta: row.id_consulta ? {
            id: row.id_consulta,
            cpf_consultado: row.cpf_consultado || '',
            data_consulta: row.data_consulta ? new Date(row.data_consulta) : null,
            resultado: row.resultado || ''
          } : undefined
        });
      }
      
      inadimplentesMap.get(row.id).dividas.push({
        id: row.id_divida,
        cliente_id: row.cliente_id,
        descricao: row.descricao,
        valor: row.valor,
        data: new Date(row.data_vencimento),
        status: row.divida_status
      });
    });

    const inadimplentes = Array.from(inadimplentesMap.values());
    const valorTotalDividas = inadimplentes.reduce((total: number, inadimplente) => 
      total + inadimplente.dividas.reduce((subtotal: number, divida: { valor: number }) => subtotal + divida.valor, 0), 0);

    return {
      totalInadimplentes: inadimplentes.length,
      valorTotalDividas,
      inadimplentes
    };
  }

  async gerarRelatorioConsultas(dataInicio: Date, dataFim: Date): Promise<RelatorioConsultas> {
    const query = `
      WITH consultas_por_dia AS (
        SELECT 
          DATE(data_consulta) as data,
          COUNT(*) as quantidade
        FROM consultas
        WHERE data_consulta BETWEEN $1 AND $2
        GROUP BY DATE(data_consulta)
      )
      SELECT 
        cpd.*,
        c.*
      FROM consultas_por_dia cpd
      LEFT JOIN consultas c ON DATE(c.data_consulta) = cpd.data
      ORDER BY c.data_consulta DESC
    `;

    const result = await db.query<ConsultaRow>(query, [dataInicio, dataFim]);
    
    const consultasPorPeriodo = result.rows
      .filter((row, index, self) => 
        index === self.findIndex(r => r.data === row.data)
      )
      .map((row: ConsultaRow) => ({
        data: new Date(row.data),
        quantidade: parseInt(row.quantidade)
      }));

    return {
      totalConsultas: result.rowCount || 0,
      consultasPorPeriodo,
      consultas: result.rows
        .filter(row => row.id)
        .map((row: ConsultaRow) => ({
          id: row.id,
          cpf_consultado: row.cpf_consultado,
          data_consulta: new Date(row.data_consulta),
          resultado: row.resultado
        }))
    };
  }

  async gerarRelatorioDividas(): Promise<RelatorioDividas> {
    const query = `
      WITH totais AS (
        SELECT 
          COUNT(*) as total,
          SUM(valor) as valor_total
        FROM dividas
      ),
      status_count AS (
        SELECT 
          status,
          COUNT(*) as count
        FROM dividas
        GROUP BY status
      )
      SELECT 
        t.*,
        sc.status,
        sc.count,
        d.*
      FROM totais t
      CROSS JOIN status_count sc
      LEFT JOIN dividas d ON 1=1
      ORDER BY d.data_vencimento DESC
    `;

    const result = await db.query<DividaRow>(query);
    
    const dividasPorStatus = {
      pendente: 0,
      pago: 0,
      cancelado: 0
    };

    result.rows.forEach((row: DividaRow) => {
      if (row.status in dividasPorStatus) {
        dividasPorStatus[row.status as keyof typeof dividasPorStatus] = parseInt(row.count);
      }
    });

    return {
      totalDividas: parseInt(result.rows[0]?.total || '0'),
      valorTotal: parseFloat(result.rows[0]?.valor_total || '0'),
      dividasPorStatus,
      dividas: result.rows
        .filter(row => row.id)
        .map((row: DividaRow) => ({
          id: row.id,
          cliente_id: row.cliente_id,
          descricao: row.descricao,
          valor: row.valor,
          data: new Date(row.data_vencimento),
          status: row.status
        }))
    };
  }
} 