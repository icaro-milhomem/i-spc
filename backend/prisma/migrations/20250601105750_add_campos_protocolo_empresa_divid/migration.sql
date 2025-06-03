/*
  Warnings:

  - You are about to drop the column `protocolo_negativacao` on the `Divida` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[protocolo]` on the table `Divida` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Divida_protocolo_negativacao_key";

-- AlterTable
ALTER TABLE "Divida" DROP COLUMN "protocolo_negativacao",
ADD COLUMN     "cnpj_empresa" TEXT,
ADD COLUMN     "empresa" TEXT,
ADD COLUMN     "protocolo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Divida_protocolo_key" ON "Divida"("protocolo");
