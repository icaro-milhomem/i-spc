"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelatorioController = void 0;
const ExportacaoService_1 = require("../services/ExportacaoService");
const RelatorioService_1 = require("../services/RelatorioService");
class RelatorioController {
    static async inadimplentes(req, res) {
        try {
            const relatorio = await RelatorioController.relatorioService.gerarRelatorioInadimplentes();
            res.json(relatorio);
        }
        catch (error) {
            console.error('Erro ao gerar relatório de inadimplentes:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório de inadimplentes' });
        }
    }
    static async exportarInadimplentesPDF(req, res) {
        try {
            const relatorio = await RelatorioController.relatorioService.gerarRelatorioInadimplentes();
            const pdfBuffer = await RelatorioController.exportacaoService.exportarInadimplentesPDF(relatorio);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=inadimplentes.pdf');
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Erro ao exportar relatório de inadimplentes em PDF:', error);
            res.status(500).json({ error: 'Erro ao exportar relatório de inadimplentes em PDF' });
        }
    }
    static async exportarInadimplentesExcel(req, res) {
        try {
            const relatorio = await RelatorioController.relatorioService.gerarRelatorioInadimplentes();
            const excelBuffer = await RelatorioController.exportacaoService.exportarInadimplentesExcel(relatorio);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=inadimplentes.xlsx');
            res.send(excelBuffer);
        }
        catch (error) {
            console.error('Erro ao exportar relatório de inadimplentes em Excel:', error);
            res.status(500).json({ error: 'Erro ao exportar relatório de inadimplentes em Excel' });
        }
    }
    static async consultas(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
            }
            const inicio = new Date(dataInicio);
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);
            if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
                return res.status(400).json({ error: 'Datas inválidas' });
            }
            if (inicio > fim) {
                return res.status(400).json({ error: 'A data de início não pode ser maior que a data de fim' });
            }
            const relatorio = await RelatorioController.relatorioService.gerarRelatorioConsultas(inicio, fim);
            res.json(relatorio);
        }
        catch (error) {
            console.error('Erro ao gerar relatório de consultas:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório de consultas' });
        }
    }
    static async exportarConsultasPDF(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
            }
            const inicio = new Date(dataInicio);
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);
            const relatorio = await RelatorioController.relatorioService.gerarRelatorioConsultas(inicio, fim);
            const pdfBuffer = await RelatorioController.exportacaoService.exportarConsultasPDF(relatorio);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=consultas.pdf');
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Erro ao exportar relatório de consultas em PDF:', error);
            res.status(500).json({ error: 'Erro ao exportar relatório de consultas em PDF' });
        }
    }
    static async exportarConsultasExcel(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            if (!dataInicio || !dataFim) {
                return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
            }
            const inicio = new Date(dataInicio);
            inicio.setHours(0, 0, 0, 0);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999);
            const relatorio = await RelatorioController.relatorioService.gerarRelatorioConsultas(inicio, fim);
            const excelBuffer = await RelatorioController.exportacaoService.exportarConsultasExcel(relatorio);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=consultas.xlsx');
            res.send(excelBuffer);
        }
        catch (error) {
            console.error('Erro ao exportar relatório de consultas em Excel:', error);
            res.status(500).json({ error: 'Erro ao exportar relatório de consultas em Excel' });
        }
    }
    static async dividas(req, res) {
        try {
            const relatorio = await RelatorioController.relatorioService.gerarRelatorioDividas();
            res.json(relatorio);
        }
        catch (error) {
            console.error('Erro ao gerar relatório de dívidas:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório de dívidas' });
        }
    }
    static async exportarDividasPDF(req, res) {
        try {
            const relatorio = await RelatorioController.relatorioService.gerarRelatorioDividas();
            const pdfBuffer = await RelatorioController.exportacaoService.exportarDividasPDF(relatorio);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=dividas.pdf');
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('Erro ao exportar relatório de dívidas em PDF:', error);
            res.status(500).json({ error: 'Erro ao exportar relatório de dívidas em PDF' });
        }
    }
    static async exportarDividasExcel(req, res) {
        try {
            const relatorio = await RelatorioController.relatorioService.gerarRelatorioDividas();
            const excelBuffer = await RelatorioController.exportacaoService.exportarDividasExcel(relatorio);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=dividas.xlsx');
            res.send(excelBuffer);
        }
        catch (error) {
            console.error('Erro ao exportar relatório de dívidas em Excel:', error);
            res.status(500).json({ error: 'Erro ao exportar relatório de dívidas em Excel' });
        }
    }
    static async debugConsultas(req, res) {
        try {
            const consultas = await RelatorioController.relatorioService.buscarTodasConsultasDebug();
            res.json(consultas);
        }
        catch (error) {
            console.error('Erro ao buscar consultas (debug):', error);
            res.status(500).json({ error: 'Erro ao buscar consultas (debug)' });
        }
    }
    static async debugInadimplentes(req, res) {
        try {
            const inadimplentes = await RelatorioController.relatorioService.buscarTodosInadimplentesDebug();
            res.json(inadimplentes);
        }
        catch (error) {
            console.error('Erro ao buscar inadimplentes (debug):', error);
            res.status(500).json({ error: 'Erro ao buscar inadimplentes (debug)' });
        }
    }
}
exports.RelatorioController = RelatorioController;
RelatorioController.relatorioService = new RelatorioService_1.RelatorioService();
RelatorioController.exportacaoService = new ExportacaoService_1.ExportacaoService();
