ALTER TABLE "users" ADD COLUMN "phone" VARCHAR(30);

CREATE TABLE "workspace_data_documents" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "module" VARCHAR(64) NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "workspace_data_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "workspace_data_documents_workspace_id_module_key"
ON "workspace_data_documents"("workspace_id", "module");

CREATE INDEX "workspace_data_documents_workspace_id_updated_at_idx"
ON "workspace_data_documents"("workspace_id", "updated_at" DESC);

ALTER TABLE "workspace_data_documents"
ADD CONSTRAINT "workspace_data_documents_workspace_id_fkey"
FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
