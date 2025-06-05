/*
  Warnings:

  - You are about to drop the column `created_at` on the `enderecos_cliente_empresa` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "enderecos_cliente_empresa" DROP CONSTRAINT "enderecos_cliente_empresa_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "enderecos_cliente_empresa" DROP CONSTRAINT "enderecos_cliente_empresa_tenant_id_fkey";

-- DropIndex
DROP INDEX "idx_endereco_cliente_empresa_cliente";

-- DropIndex
DROP INDEX "idx_endereco_cliente_empresa_tenant";

-- AlterTable
ALTER TABLE "enderecos_cliente_empresa" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "enderecos_cliente_empresa" ADD CONSTRAINT "enderecos_cliente_empresa_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enderecos_cliente_empresa" ADD CONSTRAINT "enderecos_cliente_empresa_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
