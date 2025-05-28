import { Router } from 'express';
import { RelatorioController } from '../controllers/RelatorioController';
import { authenticateJWT, isAdmin } from '../middleware/auth';

const router = Router();

// Relatório de inadimplentes
router.get('/inadimplentes', authenticateJWT, isAdmin, RelatorioController.inadimplentes);
router.get('/inadimplentes/pdf', authenticateJWT, isAdmin, RelatorioController.exportarInadimplentesPDF);
router.get('/inadimplentes/excel', authenticateJWT, isAdmin, RelatorioController.exportarInadimplentesExcel);

// Relatório de consultas
router.get('/consultas', authenticateJWT, isAdmin, RelatorioController.consultas);
router.get('/consultas/pdf', authenticateJWT, isAdmin, RelatorioController.exportarConsultasPDF);
router.get('/consultas/excel', authenticateJWT, isAdmin, RelatorioController.exportarConsultasExcel);

// Relatório de dívidas
router.get('/dividas', authenticateJWT, isAdmin, RelatorioController.dividas);
router.get('/dividas/pdf', authenticateJWT, isAdmin, RelatorioController.exportarDividasPDF);
router.get('/dividas/excel', authenticateJWT, isAdmin, RelatorioController.exportarDividasExcel);

export default router; 