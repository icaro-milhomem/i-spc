"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatorioService = void 0;
const db_1 = require("../db");
class RelatorioService {
    static async getEstatisticas() {
        const totalClientes = await db_1.prisma.cliente.count();
        const totalInadimplentes = await db_1.prisma.cliente.count({
            where: {
                dividas: {
                    some: {
                        status_negativado: true
                    }
                }
            }
        });
        const consultasHoje = await db_1.prisma.consulta.count({
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
    static async getConsultasPorPeriodo(dataInicio, dataFim) {
        return db_1.prisma.consulta.findMany({
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
    async gerarRelatorioInadimplentes() {
        const clientes = await db_1.prisma.cliente.findMany({
            where: {
                dividas: {
                    some: { status_negativado: true }
                }
            },
            include: {
                dividas: true
            }
        });
        const inadimplentes = clientes.map(cliente => ({
            cliente: Object.assign(Object.assign({}, cliente), { dividas: undefined }),
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
    async gerarRelatorioConsultas(dataInicio, dataFim) {
        console.log('Gerando relatório de consultas:', { dataInicio, dataFim });
        const consultas = await db_1.prisma.consulta.findMany({
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
        const consultasPorDia = new Map();
        consultas.forEach(consulta => {
            const data = consulta.data.toISOString().split('T')[0];
            consultasPorDia.set(data, (consultasPorDia.get(data) || 0) + 1);
        });
        const consultasPorPeriodo = Array.from(consultasPorDia.entries()).map(([data, quantidade]) => ({
            data: new Date(data),
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
    async gerarRelatorioDividas() {
        const dividasDb = await db_1.prisma.divida.findMany({
            include: { cliente: true }
        });
        const dividas = dividasDb.map((d) => {
            const status = d.status_negativado ? 'pago' : 'pendente';
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
    async buscarTodasConsultasDebug() {
        const consultas = await db_1.prisma.consulta.findMany({
            orderBy: { data: 'desc' }
        });
        console.log('DEBUG - Total de consultas encontradas:', consultas.length);
        return consultas;
    }
    async buscarTodosInadimplentesDebug() {
        const inadimplentes = await db_1.prisma.cliente.findMany({
            include: { dividas: true }
        });
        console.log('DEBUG - Total de clientes encontrados:', inadimplentes.length);
        return inadimplentes;
    }
}
exports.RelatorioService = RelatorioService;
