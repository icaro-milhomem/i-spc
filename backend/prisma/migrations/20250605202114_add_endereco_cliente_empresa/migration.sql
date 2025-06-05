/*
  Warnings:

  - You are about to drop the `EnderecoClienteEmpresa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EnderecoClienteEmpresa" DROP CONSTRAINT "EnderecoClienteEmpresa_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "EnderecoClienteEmpresa" DROP CONSTRAINT "EnderecoClienteEmpresa_tenant_id_fkey";

-- DropTable
DROP TABLE "EnderecoClienteEmpresa";

-- CreateTable
CREATE TABLE "enderecos_cliente_empresa" (
    "id" SERIAL NOT NULL,
    "cep" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enderecos_cliente_empresa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "enderecos_cliente_empresa" ADD CONSTRAINT "enderecos_cliente_empresa_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enderecos_cliente_empresa" ADD CONSTRAINT "enderecos_cliente_empresa_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
