/*
  Warnings:

  - You are about to drop the `enderecos_cliente_empresa` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "enderecos_cliente_empresa" DROP CONSTRAINT "enderecos_cliente_empresa_cliente_id_fkey";

-- DropForeignKey
ALTER TABLE "enderecos_cliente_empresa" DROP CONSTRAINT "enderecos_cliente_empresa_tenant_id_fkey";

-- DropTable
DROP TABLE "enderecos_cliente_empresa";

-- CreateTable
CREATE TABLE "EnderecoClienteEmpresa" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "endereco" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnderecoClienteEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnderecoClienteEmpresa_cliente_id_tenant_id_key" ON "EnderecoClienteEmpresa"("cliente_id", "tenant_id");

-- AddForeignKey
ALTER TABLE "EnderecoClienteEmpresa" ADD CONSTRAINT "EnderecoClienteEmpresa_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnderecoClienteEmpresa" ADD CONSTRAINT "EnderecoClienteEmpresa_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
