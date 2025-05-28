"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatorioService = void 0;
const db_1 = require("../db");
class RelatorioService {
    async gerarRelatorioInadimplentes() {
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
        const result = await db_1.db.query(query);
        const inadimplentesMap = new Map();
        result.rows.forEach((row) => {
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
        const valorTotalDividas = inadimplentes.reduce((total, inadimplente) => total + inadimplente.dividas.reduce((subtotal, divida) => subtotal + divida.valor, 0), 0);
        return {
            totalInadimplentes: inadimplentes.length,
            valorTotalDividas,
            inadimplentes
        };
    }
    async gerarRelatorioConsultas(dataInicio, dataFim) {
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
        const result = await db_1.db.query(query, [dataInicio, dataFim]);
        const consultasPorPeriodo = result.rows
            .filter((row, index, self) => index === self.findIndex(r => r.data === row.data))
            .map((row) => ({
            data: new Date(row.data),
            quantidade: parseInt(row.quantidade)
        }));
        return {
            totalConsultas: result.rowCount || 0,
            consultasPorPeriodo,
            consultas: result.rows
                .filter(row => row.id)
                .map((row) => ({
                id: row.id,
                cpf_consultado: row.cpf_consultado,
                data_consulta: new Date(row.data_consulta),
                resultado: row.resultado
            }))
        };
    }
    async gerarRelatorioDividas() {
        var _a, _b;
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
        const result = await db_1.db.query(query);
        const dividasPorStatus = {
            pendente: 0,
            pago: 0,
            cancelado: 0
        };
        result.rows.forEach((row) => {
            if (row.status in dividasPorStatus) {
                dividasPorStatus[row.status] = parseInt(row.count);
            }
        });
        return {
            totalDividas: parseInt(((_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.total) || '0'),
            valorTotal: parseFloat(((_b = result.rows[0]) === null || _b === void 0 ? void 0 : _b.valor_total) || '0'),
            dividasPorStatus,
            dividas: result.rows
                .filter(row => row.id)
                .map((row) => ({
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
exports.RelatorioService = RelatorioService;
