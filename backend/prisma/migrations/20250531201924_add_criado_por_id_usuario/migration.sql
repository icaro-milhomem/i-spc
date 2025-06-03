-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "criado_por_id" INTEGER;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
