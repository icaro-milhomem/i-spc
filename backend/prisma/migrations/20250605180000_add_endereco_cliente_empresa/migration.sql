-- Migration para criar tabela de endereços por cliente e empresa
CREATE TABLE "enderecos_cliente_empresa" (
  "id" SERIAL PRIMARY KEY,
  "cliente_id" INTEGER NOT NULL REFERENCES "clientes"(id) ON DELETE CASCADE,
  "tenant_id" INTEGER NOT NULL REFERENCES "tenants"(id) ON DELETE CASCADE,
  "endereco" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_endereco_cliente_empresa_cliente ON "enderecos_cliente_empresa" ("cliente_id");
CREATE INDEX idx_endereco_cliente_empresa_tenant ON "enderecos_cliente_empresa" ("tenant_id");
