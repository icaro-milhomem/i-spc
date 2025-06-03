/*
  Warnings:

  - You are about to drop the `dividas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "dividas" DROP CONSTRAINT "dividas_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "notificacoes" DROP CONSTRAINT "notificacoes_divida_id_fkey";

-- DropTable
DROP TABLE "dividas";

-- CreateTable
CREATE TABLE "Divida" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "nome_devedor" TEXT NOT NULL,
    "cpf_cnpj_devedor" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "descricao" TEXT,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "protocolo_negativacao" TEXT NOT NULL,
    "status_negativado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Divida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Divida_protocolo_negativacao_key" ON "Divida"("protocolo_negativacao");

-- AddForeignKey
ALTER TABLE "Divida" ADD CONSTRAINT "Divida_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Divida" ADD CONSTRAINT "Divida_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Divida" ADD CONSTRAINT "Divida_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_divida_id_fkey" FOREIGN KEY ("divida_id") REFERENCES "Divida"("id") ON DELETE SET NULL ON UPDATE CASCADE;
