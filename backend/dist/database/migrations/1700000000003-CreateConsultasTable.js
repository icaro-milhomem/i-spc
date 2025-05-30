"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateConsultasTable1700000000003 = void 0;
class CreateConsultasTable1700000000003 {
    constructor() {
        this.name = 'CreateConsultasTable1700000000003';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "consultas" (
                "id" SERIAL NOT NULL,
                "data" TIMESTAMP NOT NULL,
                "paciente_id" integer NOT NULL,
                "medico_id" integer NOT NULL,
                "status" character varying NOT NULL DEFAULT 'agendada',
                "observacoes" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_consultas" PRIMARY KEY ("id"),
                CONSTRAINT "FK_consultas_pacientes" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                CONSTRAINT "FK_consultas_medicos" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "consultas"`);
    }
}
exports.CreateConsultasTable1700000000003 = CreateConsultasTable1700000000003;
