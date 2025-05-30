import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateConsultasTable1700000000003 implements MigrationInterface {
    name = 'CreateConsultasTable1700000000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "consultas"`)
    }
} 