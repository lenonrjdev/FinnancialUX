import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "../generated/prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { isFinanceDataModule } from "./finance-data.constants";

@Injectable()
export class FinanceDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(workspaceId: string) {
    const documents = await this.prisma.workspaceDataDocument.findMany({
      where: { workspaceId },
      orderBy: { module: "asc" },
    });

    return Object.fromEntries(
      documents.map((document) => [
        document.module,
        {
          data: document.data,
          updatedAt: document.updatedAt.toISOString(),
        },
      ]),
    );
  }

  async get(workspaceId: string, module: string) {
    this.requireKnownModule(module);
    const document = await this.prisma.workspaceDataDocument.findUnique({
      where: { workspaceId_module: { workspaceId, module } },
    });

    return {
      module,
      data: document?.data ?? null,
      updatedAt: document?.updatedAt.toISOString() ?? null,
    };
  }

  async upsert(workspaceId: string, userId: string, module: string, data: unknown) {
    this.requireKnownModule(module);
    const json = this.toJson(data);
    const document = await this.prisma.workspaceDataDocument.upsert({
      where: { workspaceId_module: { workspaceId, module } },
      update: { data: json },
      create: { workspaceId, module, data: json },
    });

    void this.audit.log({
      workspaceId,
      userId,
      action: "finance.data.upsert",
      entity: "workspace_data_document",
      entityId: document.id,
      metadata: { module },
    }).catch(() => undefined);

    return {
      module: document.module,
      data: document.data,
      updatedAt: document.updatedAt.toISOString(),
    };
  }

  async remove(workspaceId: string, userId: string, module: string) {
    this.requireKnownModule(module);
    await this.prisma.workspaceDataDocument.deleteMany({
      where: { workspaceId, module },
    });

    void this.audit.log({
      workspaceId,
      userId,
      action: "finance.data.delete",
      entity: "workspace_data_document",
      metadata: { module },
    }).catch(() => undefined);

    return { message: "Dados do módulo removidos." };
  }

  private requireKnownModule(module: string): void {
    if (!isFinanceDataModule(module)) {
      throw new BadRequestException("Módulo financeiro inválido.");
    }
  }

  private toJson(value: unknown): Prisma.InputJsonValue {
    if (value === undefined) {
      throw new BadRequestException("O campo data é obrigatório.");
    }

    try {
      return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
    } catch {
      throw new BadRequestException("Os dados enviados não são JSON válido.");
    }
  }
}
