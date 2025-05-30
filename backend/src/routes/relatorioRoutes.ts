import { Router } from 'express';
import { RelatorioController } from '../controllers/RelatorioController';
import { authenticateJWT, hasPermission } from '../middleware/auth';

const router = Router();

// Relatório de inadimplentes
router.get('/inadimplentes', authenticateJWT, hasPermission('acessar_relatorios'), RelatorioController.inadimplentes);
router.get('/inadimplentes/pdf', authenticateJWT, hasPermission('acessar_relatorios'), RelatorioController.exportarInadimplentesPDF);
router.get('/inadimplentes/excel', authenticateJWT, hasPermission('acessar_relatorios'), RelatorioController.exportarInadimplentesExcel);

// Relatório de consultas
router.get('/consultas', authenticateJWT, hasPermission('acessar_relatorios'), RelatorioController.consultas);
router.get('/consultas/pdf', authenticateJWT, hasPermission('acessar_relatorios'), RelatorioController.exportarConsultasPDF);
router.get('/consultas/excel', authenticateJWT, hasPermission('acessar_relatorios'), RelatorioController.exportarConsultasExcel);

// Relatório de dívidas
router.get('/dividas', authenticateJWT, hasPermission('acessar_relatorios'), RelatorioController.dividas);
router.get('/dividas/pdf', authenticateJWT, hasPermission('acessar_relatorios'), RelatorioController.exportarDividasPDF);
router.get('/dividas/excel', authenticateJWT, hasPermission('acessar_relatorios'), RelatorioController.exportarDividasExcel);

export default router; 