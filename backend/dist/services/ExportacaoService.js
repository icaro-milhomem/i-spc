"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportacaoService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const exceljs_1 = __importDefault(require("exceljs"));
const formatters_1 = require("../utils/formatters");
class ExportacaoService {
    async exportarInadimplentesPDF(relatorio) {
        const doc = new pdfkit_1.default();
        const chunks = [];
        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(20).text('Relatório de Inadimplentes', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Total de Inadimplentes: ${relatorio.totalInadimplentes}`);
            doc.text(`Valor Total das Dívidas: ${(0, formatters_1.formatCurrency)(relatorio.valorTotalDividas)}`);
            doc.moveDown();
            relatorio.inadimplentes.forEach((inadimplente) => {
                doc.fontSize(14).text(`Cliente: ${inadimplente.cliente.nome}`);
                doc.fontSize(12).text(`CPF: ${inadimplente.cliente.cpf}`);
                doc.text(`Telefone: ${inadimplente.cliente.telefone}`);
                doc.moveDown();
                doc.text('Dívidas:');
                inadimplente.dividas.forEach((divida) => {
                    doc.text(`- ${divida.descricao}: ${(0, formatters_1.formatCurrency)(divida.valor)} (Vencimento: ${divida.data.toLocaleDateString()})`);
                });
                doc.moveDown();
            });
            doc.end();
        });
    }
    async exportarConsultasPDF(relatorio) {
        const doc = new pdfkit_1.default();
        const chunks = [];
        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(20).text('Relatório de Consultas', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Total de Consultas: ${relatorio.totalConsultas}`);
            doc.moveDown();
            doc.text('Consultas por Período:');
            relatorio.consultasPorPeriodo.forEach((periodo) => {
                doc.text(`${periodo.data.toLocaleDateString()}: ${periodo.quantidade} consultas`);
            });
            doc.moveDown();
            doc.text('Detalhamento das Consultas:');
            relatorio.consultas.forEach((consulta) => {
                doc.text(`CPF: ${consulta.cpf_consultado}`);
                doc.text(`Data: ${consulta.data_consulta.toLocaleDateString()}`);
                doc.text(`Resultado: ${consulta.resultado}`);
                doc.moveDown();
            });
            doc.end();
        });
    }
    async exportarDividasPDF(relatorio) {
        const doc = new pdfkit_1.default();
        const chunks = [];
        return new Promise((resolve, reject) => {
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            doc.fontSize(20).text('Relatório de Dívidas', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Total de Dívidas: ${relatorio.totalDividas}`);
            doc.text(`Valor Total: ${(0, formatters_1.formatCurrency)(relatorio.valorTotal)}`);
            doc.moveDown();
            doc.text('Dívidas por Status:');
            Object.entries(relatorio.dividasPorStatus).forEach(([status, quantidade]) => {
                doc.text(`${status}: ${quantidade}`);
            });
            doc.moveDown();
            doc.text('Detalhamento das Dívidas:');
            relatorio.dividas.forEach((divida) => {
                doc.text(`Descrição: ${divida.descricao}`);
                doc.text(`Valor: ${(0, formatters_1.formatCurrency)(divida.valor)}`);
                doc.text(`Vencimento: ${divida.data.toLocaleDateString()}`);
                doc.text(`Status: ${divida.status}`);
                doc.moveDown();
            });
            doc.end();
        });
    }
    async exportarInadimplentesExcel(relatorio) {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Inadimplentes');
        worksheet.columns = [
            { header: 'Nome', key: 'nome', width: 30 },
            { header: 'CPF', key: 'cpf', width: 15 },
            { header: 'Telefone', key: 'telefone', width: 15 },
            { header: 'Valor Total', key: 'valorTotal', width: 15 },
            { header: 'Última Consulta', key: 'ultimaConsulta', width: 20 }
        ];
        relatorio.inadimplentes.forEach((inadimplente) => {
            var _a, _b;
            worksheet.addRow({
                nome: inadimplente.cliente.nome,
                cpf: inadimplente.cliente.cpf,
                telefone: inadimplente.cliente.telefone,
                valorTotal: inadimplente.dividas.reduce((sum, d) => sum + d.valor, 0),
                ultimaConsulta: ((_b = (_a = inadimplente.ultimaConsulta) === null || _a === void 0 ? void 0 : _a.data_consulta) === null || _b === void 0 ? void 0 : _b.toLocaleDateString()) || 'N/A'
            });
        });
        return workbook.xlsx.writeBuffer();
    }
    async exportarConsultasExcel(relatorio) {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Consultas');
        worksheet.columns = [
            { header: 'Data', key: 'data', width: 15 },
            { header: 'CPF Consultado', key: 'cpf', width: 15 },
            { header: 'Resultado', key: 'resultado', width: 30 }
        ];
        relatorio.consultas.forEach((consulta) => {
            worksheet.addRow({
                data: consulta.data_consulta.toLocaleDateString(),
                cpf: consulta.cpf_consultado,
                resultado: consulta.resultado
            });
        });
        return workbook.xlsx.writeBuffer();
    }
    async exportarDividasExcel(relatorio) {
        const workbook = new exceljs_1.default.Workbook();
        const worksheet = workbook.addWorksheet('Dívidas');
        worksheet.columns = [
            { header: 'Descrição', key: 'descricao', width: 30 },
            { header: 'Valor', key: 'valor', width: 15 },
            { header: 'Vencimento', key: 'vencimento', width: 15 },
            { header: 'Status', key: 'status', width: 15 }
        ];
        relatorio.dividas.forEach((divida) => {
            worksheet.addRow({
                descricao: divida.descricao,
                valor: divida.valor,
                vencimento: divida.data.toLocaleDateString(),
                status: divida.status
            });
        });
        return workbook.xlsx.writeBuffer();
    }
}
exports.ExportacaoService = ExportacaoService;
