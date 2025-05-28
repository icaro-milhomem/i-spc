-- Inserir papéis básicos primeiro
INSERT INTO papeis (nome, descricao) VALUES
('Administrador', 'Acesso total ao sistema'),
('Operador', 'Acesso básico ao sistema');

-- Inserir usuário administrador padrão
INSERT INTO usuarios (nome, email, senha, perfil)
VALUES (
    'Administrador',
    'admin@pspc.com',
    -- Senha: 123456
    '$2b$10$wn/pvsI24jM8I5NfP2GTfeAu.B38lKIIV2cD4kKaH2ejW5a.CAreG',
    'admin'
);

-- Inserir permissões básicas
INSERT INTO permissoes (nome, descricao, codigo) VALUES
('Visualizar Clientes', 'Permite visualizar a lista de clientes', 'clientes.visualizar'),
('Criar Clientes', 'Permite criar novos clientes', 'clientes.criar'),
('Editar Clientes', 'Permite editar clientes existentes', 'clientes.editar'),
('Excluir Clientes', 'Permite excluir clientes', 'clientes.excluir'),
('Visualizar Dívidas', 'Permite visualizar a lista de dívidas', 'dividas.visualizar'),
('Criar Dívidas', 'Permite criar novas dívidas', 'dividas.criar'),
('Editar Dívidas', 'Permite editar dívidas existentes', 'dividas.editar'),
('Excluir Dívidas', 'Permite excluir dívidas', 'dividas.excluir'),
('Visualizar Usuários', 'Permite visualizar a lista de usuários', 'usuarios.visualizar'),
('Criar Usuários', 'Permite criar novos usuários', 'usuarios.criar'),
('Editar Usuários', 'Permite editar usuários existentes', 'usuarios.editar'),
('Excluir Usuários', 'Permite excluir usuários', 'usuarios.excluir'),
('Visualizar Relatórios', 'Permite visualizar relatórios', 'relatorios.visualizar'),
('Gerar Relatórios', 'Permite gerar novos relatórios', 'relatorios.gerar'),
('Visualizar Logs', 'Permite visualizar logs do sistema', 'logs.visualizar'),
('Visualizar Notificações', 'Permite visualizar notificações', 'notificacoes.visualizar'),
('Gerenciar Configurações', 'Permite gerenciar configurações do sistema', 'configuracoes.gerenciar'),
('Gerenciar Permissões', 'Permite gerenciar permissões', 'permissoes.gerenciar'),
('Gerenciar Papéis', 'Permite gerenciar papéis', 'papeis.gerenciar');

-- Associar todas as permissões ao papel de administrador
INSERT INTO papeis_permissoes (papel_id, permissao_id)
SELECT 
    (SELECT id FROM papeis WHERE nome = 'Administrador'),
    id
FROM permissoes;

-- Associar permissões básicas ao papel de operador
INSERT INTO papeis_permissoes (papel_id, permissao_id)
SELECT 
    (SELECT id FROM papeis WHERE nome = 'Operador'),
    id
FROM permissoes
WHERE codigo IN (
    'clientes.visualizar',
    'clientes.criar',
    'clientes.editar',
    'dividas.visualizar',
    'dividas.criar',
    'dividas.editar',
    'notificacoes.visualizar'
);

-- Associar papel de administrador ao usuário admin
INSERT INTO usuarios_papeis (usuario_id, papel_id)
SELECT 
    (SELECT id FROM usuarios WHERE email = 'admin@pspc.com'),
    (SELECT id FROM papeis WHERE nome = 'Administrador');

-- Inserir configurações iniciais
INSERT INTO configuracoes (chave, valor, descricao) VALUES
('email.smtp.host', 'smtp.gmail.com', 'Host do servidor SMTP'),
('email.smtp.port', '587', 'Porta do servidor SMTP'),
('email.smtp.user', 'noreply@ispc.com', 'Usuário do servidor SMTP'),
('email.smtp.pass', '', 'Senha do servidor SMTP'),
('email.from', 'noreply@ispc.com', 'Email de origem'),
('email.fromName', 'i-SPC', 'Nome de origem do email'),
('sistema.nome', 'i-SPC', 'Nome do sistema'),
('sistema.versao', '1.0.0', 'Versão do sistema'),
('sistema.timezone', 'America/Sao_Paulo', 'Fuso horário do sistema'),
('sistema.dataFormat', 'DD/MM/YYYY', 'Formato de data do sistema'),
('sistema.horaFormat', 'HH:mm:ss', 'Formato de hora do sistema'),
('sistema.moeda', 'BRL', 'Código da moeda do sistema'),
('sistema.moedaSimbolo', 'R$', 'Símbolo da moeda do sistema'),
('sistema.moedaSeparador', ',', 'Separador decimal da moeda'),
('sistema.moedaSeparadorMilhar', '.', 'Separador de milhar da moeda'),
('sistema.paginacao.itensPorPagina', '10', 'Número de itens por página'),
('sistema.paginacao.opcoes', '[5,10,25,50]', 'Opções de itens por página'),
('sistema.upload.maxSize', '5242880', 'Tamanho máximo de upload (5MB)'),
('sistema.upload.allowedTypes', '["image/jpeg","image/png","application/pdf"]', 'Tipos de arquivo permitidos'),
('sistema.backup.auto', 'true', 'Backup automático'),
('sistema.backup.interval', '24', 'Intervalo de backup em horas'),
('sistema.backup.retention', '7', 'Retenção de backups em dias'),
('sistema.log.retention', '30', 'Retenção de logs em dias'),
('sistema.notificacao.email', 'true', 'Enviar notificações por email'),
('sistema.notificacao.sms', 'false', 'Enviar notificações por SMS'),
('sistema.seguranca.senhaMinLength', '8', 'Tamanho mínimo da senha'),
('sistema.seguranca.senhaRequerMaiuscula', 'true', 'Senha requer letra maiúscula'),
('sistema.seguranca.senhaRequerMinuscula', 'true', 'Senha requer letra minúscula'),
('sistema.seguranca.senhaRequerNumero', 'true', 'Senha requer número'),
('sistema.seguranca.senhaRequerEspecial', 'false', 'Senha requer caractere especial'),
('sistema.seguranca.tentativasLogin', '3', 'Número de tentativas de login'),
('sistema.seguranca.bloqueioTempo', '30', 'Tempo de bloqueio em minutos'),
('sistema.seguranca.sessaoTempo', '120', 'Tempo de sessão em minutos'),
('sistema.seguranca.tokenExpiracao', '24', 'Tempo de expiração do token em horas'); 