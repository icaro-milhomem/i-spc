"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSampleData1700000000002 = void 0;
class CreateSampleData1700000000002 {
    constructor() {
        this.name = 'CreateSampleData1700000000002';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            INSERT INTO clientes (nome, cpf_cnpj, email, telefone, endereco) VALUES
            ('João Silva', '123.456.789-00', 'joao@email.com', '(11) 99999-9999', 'Rua A, 123'),
            ('Maria Santos', '987.654.321-00', 'maria@email.com', '(11) 98888-8888', 'Rua B, 456'),
            ('Empresa XYZ', '12.345.678/0001-90', 'contato@xyz.com', '(11) 97777-7777', 'Av. C, 789');
        `);
        await queryRunner.query(`
            INSERT INTO dividas (cliente_id, valor, data_vencimento, status, descricao) VALUES
            (1, 150.00, CURRENT_DATE + INTERVAL '5 days', 'pendente', 'Mensalidade Janeiro'),
            (1, 150.00, CURRENT_DATE + INTERVAL '35 days', 'pendente', 'Mensalidade Fevereiro'),
            (2, 200.00, CURRENT_DATE - INTERVAL '5 days', 'atrasada', 'Mensalidade Dezembro'),
            (3, 500.00, CURRENT_DATE - INTERVAL '15 days', 'atrasada', 'Mensalidade Novembro');
        `);
        await queryRunner.query(`
            INSERT INTO notificacoes (cliente_id, divida_id, tipo, mensagem, status) VALUES
            (1, 1, 'email', 'Lembrete: Sua fatura vence em 5 dias', 'pendente'),
            (2, 3, 'sms', 'Sua fatura está atrasada há 5 dias', 'pendente'),
            (3, 4, 'email', 'Sua fatura está atrasada há 15 dias', 'pendente');
        `);
        await queryRunner.query(`
            INSERT INTO logs (usuario_id, acao, tabela, registro_id, dados)
            SELECT 
                (SELECT id FROM usuarios WHERE email = 'admin@pspc.com'),
                'CREATE',
                'clientes',
                1,
                '{"nome": "João Silva", "email": "joao@email.com"}'::jsonb
            UNION ALL
            SELECT 
                (SELECT id FROM usuarios WHERE email = 'admin@pspc.com'),
                'CREATE',
                'dividas',
                1,
                '{"valor": 150.00, "cliente_id": 1}'::jsonb
            UNION ALL
            SELECT 
                (SELECT id FROM usuarios WHERE email = 'admin@pspc.com'),
                'CREATE',
                'notificacoes',
                1,
                '{"tipo": "email", "cliente_id": 1}'::jsonb;
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM logs;`);
        await queryRunner.query(`DELETE FROM notificacoes;`);
        await queryRunner.query(`DELETE FROM dividas;`);
        await queryRunner.query(`DELETE FROM clientes;`);
    }
}
exports.CreateSampleData1700000000002 = CreateSampleData1700000000002;
