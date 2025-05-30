/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "razao_social" TEXT,
ADD COLUMN     "uf" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tenants_cnpj_key" ON "tenants"("cnpj");
