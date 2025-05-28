import { Router } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { DividaController } from '../controllers/DividaController';
import { ConsultaController } from '../controllers/ConsultaController';
import { UsuarioController } from '../controllers/UsuarioController';
import { authenticateJWT } from '../middleware/auth';
import { isAdmin } from '../middleware/auth';
import { DashboardController } from '../controllers/DashboardController';
import relatorioRoutes from './relatorioRoutes';
import authRoutes from './authRoutes';
import clienteRoutes from './clienteRoutes';
import dividaRoutes from './dividaRoutes';
import notificacaoRoutes from './notificacaoRoutes';
import usuarioRoutes from './usuarioRoutes';
import papelRoutes from './papelRoutes';
import permissaoRoutes from './permissaoRoutes';
import configuracaoRoutes from './configuracaoRoutes';
import backupRoutes from './backupRoutes';
import logRoutes from './logRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

// Rotas de Autenticação
router.use('/auth', authRoutes);

// Rotas de Usuário
router.use('/usuarios', usuarioRoutes);

// Rotas de Cliente
router.use('/clientes', clienteRoutes);

// Rotas de Dívida
router.use('/dividas', dividaRoutes);

// Rotas de Notificação
router.use('/notificacoes', notificacaoRoutes);

// Rotas de Papel
router.use('/papeis', papelRoutes);

// Rotas de Permissão
router.use('/permissoes', permissaoRoutes);

// Rotas de Configuração
router.use('/configuracoes', configuracaoRoutes);

// Rotas de Backup
router.use('/backups', backupRoutes);

// Rotas de Log
router.use('/logs', logRoutes);

// Rotas de Dashboard
router.use('/dashboard', dashboardRoutes);

// Rotas de Consulta
router.get('/consulta/:cpf', authenticateJWT, ConsultaController.consultarCPF);
router.get('/consulta/:cpf/historico', authenticateJWT, ConsultaController.buscarHistorico);

// Rotas de Relatório
router.use('/relatorios', relatorioRoutes);

export default router; 