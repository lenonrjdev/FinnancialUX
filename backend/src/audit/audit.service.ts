import { Injectable } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";

export type AuditInput = {
  userId?: string;
  workspaceId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        workspaceId: input.workspaceId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata as never,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }
}
