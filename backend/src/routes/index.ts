import { Router } from 'express';
import { ConsultaController } from '../controllers/ConsultaController';
import { authenticateJWT  } from '../middleware/auth';
import authRoutes from './authRoutes';
import backupRoutes from './backupRoutes';
import clienteRoutes from './clienteRoutes';
import configuracaoRoutes from './configuracaoRoutes';
import dashboardRoutes from './dashboardRoutes';
import dividaRoutes from './dividaRoutes';
import logRoutes from './logRoutes';
import notificacaoRoutes from './notificacaoRoutes';
import papelRoutes from './papelRoutes';
import permissaoRoutes from './permissaoRoutes';
import relatorioRoutes from './relatorioRoutes';
import tenantRoutes from './tenantRoutes';
import usuarioRoutes from './usuarioRoutes';
import enderecoClienteRoutes from './enderecoClienteRoutes';
import speedioRoutes from './speedioRoutes';

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

// Rotas de Tenant
router.use('/tenants', tenantRoutes);

// Rotas de Endereço
router.use('/enderecos', enderecoClienteRoutes);

// Rotas de Consulta
router.get('/consulta/:cpf', authenticateJWT, ConsultaController.consultarCPF);
router.get('/consulta/:cpf/historico', authenticateJWT, ConsultaController.buscarHistorico);
router.post('/consultas/registrar', authenticateJWT, ConsultaController.registrar);

// Rotas de Speedio (proxy para consulta de CNPJ)
router.use('/speedio', speedioRoutes);

// Rotas de Relatório
router.use('/relatorios', relatorioRoutes);

export default router;