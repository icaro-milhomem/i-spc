-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "criado_por_id" INTEGER;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
