-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('admin', 'operador')),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inadimplente', 'bloqueado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de dívidas
CREATE TABLE IF NOT EXISTS dividas (
    id SERIAL PRIMARY KEY,
    id_cliente INTEGER REFERENCES clientes(id),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS permissoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de papéis
CREATE TABLE IF NOT EXISTS papeis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de associação entre papéis e permissões
CREATE TABLE IF NOT EXISTS papeis_permissoes (
    papel_id INTEGER REFERENCES papeis(id) ON DELETE CASCADE,
    permissao_id INTEGER REFERENCES permissoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (papel_id, permissao_id)
);

-- Tabela de associação entre usuários e papéis
CREATE TABLE IF NOT EXISTS usuarios_papeis (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    papel_id INTEGER REFERENCES papeis(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, papel_id)
);

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS relatorios (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'concluido', 'erro')),
    parametros JSONB,
    resultado JSONB,
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao VARCHAR(50) NOT NULL,
    entidade VARCHAR(50) NOT NULL,
    entidade_id INTEGER,
    detalhes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS tokens_recuperacao_senha (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(100) UNIQUE NOT NULL,
    expiracao TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_dividas_cliente_id ON dividas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_permissoes_codigo ON permissoes(codigo);
CREATE INDEX IF NOT EXISTS idx_papeis_permissoes_papel_id ON papeis_permissoes(papel_id);
CREATE INDEX IF NOT EXISTS idx_papeis_permissoes_permissao_id ON papeis_permissoes(permissao_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_papeis_usuario_id ON usuarios_papeis(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_papeis_papel_id ON usuarios_papeis(papel_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_usuario_id ON relatorios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_usuario_id ON logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_senha_token ON tokens_recuperacao_senha(token);
CREATE INDEX IF NOT EXISTS idx_tokens_recuperacao_senha_usuario_id ON tokens_recuperacao_senha(usuario_id);

-- Trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática do updated_at
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dividas_updated_at
    BEFORE UPDATE ON dividas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissoes_updated_at
    BEFORE UPDATE ON permissoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_papeis_updated_at
    BEFORE UPDATE ON papeis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relatorios_updated_at
    BEFORE UPDATE ON relatorios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notificacoes_updated_at
    BEFORE UPDATE ON notificacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 