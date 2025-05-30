-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "consultas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
