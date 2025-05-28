"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInitialSchema1700000000000 = void 0;
class CreateInitialSchema1700000000000 {
    constructor() {
        this.name = 'CreateInitialSchema1700000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                senha VARCHAR(100) NOT NULL,
                perfil VARCHAR(20) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'ativo',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE papeis (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(50) UNIQUE NOT NULL,
                descricao TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE permissoes (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                descricao TEXT,
                codigo VARCHAR(50) UNIQUE NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE papeis_permissoes (
                id SERIAL PRIMARY KEY,
                papel_id INTEGER NOT NULL REFERENCES papeis(id),
                permissao_id INTEGER NOT NULL REFERENCES permissoes(id),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(papel_id, permissao_id)
            );

            CREATE TABLE usuarios_papeis (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                papel_id INTEGER NOT NULL REFERENCES papeis(id),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(usuario_id, papel_id)
            );

            CREATE TABLE configuracoes (
                id SERIAL PRIMARY KEY,
                chave VARCHAR(100) UNIQUE NOT NULL,
                valor TEXT NOT NULL,
                descricao TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE clientes (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(100),
                telefone VARCHAR(20),
                endereco TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE dividas (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER NOT NULL REFERENCES clientes(id),
                valor DECIMAL(10,2) NOT NULL,
                data_vencimento DATE NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pendente',
                descricao TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE notificacoes (
                id SERIAL PRIMARY KEY,
                cliente_id INTEGER NOT NULL REFERENCES clientes(id),
                divida_id INTEGER REFERENCES dividas(id),
                tipo VARCHAR(20) NOT NULL,
                mensagem TEXT NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'pendente',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE logs (
                id SERIAL PRIMARY KEY,
                usuario_id INTEGER REFERENCES usuarios(id),
                acao VARCHAR(50) NOT NULL,
                tabela VARCHAR(50) NOT NULL,
                registro_id INTEGER,
                dados JSONB,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE backups (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                caminho VARCHAR(255) NOT NULL,
                tamanho INTEGER NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await queryRunner.query(`
            CREATE INDEX idx_usuarios_email ON usuarios(email);
            CREATE INDEX idx_usuarios_perfil ON usuarios(perfil);
            CREATE INDEX idx_usuarios_status ON usuarios(status);
            CREATE INDEX idx_papeis_nome ON papeis(nome);
            CREATE INDEX idx_permissoes_codigo ON permissoes(codigo);
            CREATE INDEX idx_papeis_permissoes_papel ON papeis_permissoes(papel_id);
            CREATE INDEX idx_papeis_permissoes_permissao ON papeis_permissoes(permissao_id);
            CREATE INDEX idx_usuarios_papeis_usuario ON usuarios_papeis(usuario_id);
            CREATE INDEX idx_usuarios_papeis_papel ON usuarios_papeis(papel_id);
            CREATE INDEX idx_configuracoes_chave ON configuracoes(chave);
            CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
            CREATE INDEX idx_clientes_email ON clientes(email);
            CREATE INDEX idx_dividas_cliente ON dividas(cliente_id);
            CREATE INDEX idx_dividas_status ON dividas(status);
            CREATE INDEX idx_dividas_vencimento ON dividas(data_vencimento);
            CREATE INDEX idx_notificacoes_cliente ON notificacoes(cliente_id);
            CREATE INDEX idx_notificacoes_divida ON notificacoes(divida_id);
            CREATE INDEX idx_notificacoes_status ON notificacoes(status);
            CREATE INDEX idx_logs_usuario ON logs(usuario_id);
            CREATE INDEX idx_logs_acao ON logs(acao);
            CREATE INDEX idx_logs_tabela ON logs(tabela);
            CREATE INDEX idx_logs_registro ON logs(registro_id);
            CREATE INDEX idx_logs_data ON logs(created_at);
        `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        await queryRunner.query(`
            CREATE TRIGGER update_usuarios_updated_at
                BEFORE UPDATE ON usuarios
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_papeis_updated_at
                BEFORE UPDATE ON papeis
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_permissoes_updated_at
                BEFORE UPDATE ON permissoes
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_configuracoes_updated_at
                BEFORE UPDATE ON configuracoes
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

            CREATE TRIGGER update_notificacoes_updated_at
                BEFORE UPDATE ON notificacoes
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
            DROP TRIGGER IF EXISTS update_papeis_updated_at ON papeis;
            DROP TRIGGER IF EXISTS update_permissoes_updated_at ON permissoes;
            DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON configuracoes;
            DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
            DROP TRIGGER IF EXISTS update_dividas_updated_at ON dividas;
            DROP TRIGGER IF EXISTS update_notificacoes_updated_at ON notificacoes;
        `);
        await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);
        await queryRunner.query(`
            DROP TABLE IF EXISTS backups;
            DROP TABLE IF EXISTS logs;
            DROP TABLE IF EXISTS notificacoes;
            DROP TABLE IF EXISTS dividas;
            DROP TABLE IF EXISTS clientes;
            DROP TABLE IF EXISTS configuracoes;
            DROP TABLE IF EXISTS usuarios_papeis;
            DROP TABLE IF EXISTS papeis_permissoes;
            DROP TABLE IF EXISTS permissoes;
            DROP TABLE IF EXISTS papeis;
            DROP TABLE IF EXISTS usuarios;
        `);
    }
}
exports.CreateInitialSchema1700000000000 = CreateInitialSchema1700000000000;
