import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "node:crypto";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async list(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId, workspace: { archivedAt: null } },
      include: { workspace: { include: { _count: { select: { members: true } } } } },
      orderBy: { joinedAt: "asc" },
    });
    return memberships.map((membership) => this.mapWorkspace(membership.workspace, membership.role, membership.lastAccessAt ?? membership.joinedAt));
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = `${this.slugify(dto.name)}-${randomBytes(3).toString("hex")}`;
    const workspace = await this.prisma.workspace.create({
      data: {
        ownerUserId: userId,
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        type: "SHARED",
        members: { create: { userId, role: "OWNER", lastAccessAt: new Date() } },
      },
      include: { _count: { select: { members: true } } },
    });
    void this.audit.log({ userId, workspaceId: workspace.id, action: "workspace.create", entity: "workspace", entityId: workspace.id }).catch(() => undefined);
    return this.mapWorkspace(workspace, "OWNER", workspace.createdAt);
  }

  async details(userId: string, workspaceId: string) {
    const membership = await this.requireMembership(userId, workspaceId);
    const workspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      include: { _count: { select: { members: true } } },
    });
    return this.mapWorkspace(workspace, membership.role, membership.lastAccessAt ?? membership.joinedAt);
  }

  async members(userId: string, workspaceId: string) {
    await this.requireMembership(userId, workspaceId);
    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    });
    return members.map((member) => ({
      id: member.id,
      workspaceId: member.workspaceId,
      name: member.user.name,
      email: member.user.email,
      initials: this.initials(member.user.name),
      role: member.role.toLowerCase(),
      joinedAt: member.joinedAt.toISOString(),
      lastAccessAt: (member.lastAccessAt ?? member.joinedAt).toISOString(),
      isCurrentUser: member.userId === userId,
    }));
  }

  async updateMemberRole(userId: string, workspaceId: string, memberId: string, role: "editor" | "viewer") {
    await this.requireOwner(userId, workspaceId);
    const member = await this.prisma.workspaceMember.findFirst({ where: { id: memberId, workspaceId } });
    if (!member) throw new NotFoundException("Participante não encontrado.");
    if (member.role === "OWNER") throw new ForbiddenException("O proprietário não pode ter a função alterada.");

    const updated = await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: role.toUpperCase() as "EDITOR" | "VIEWER" },
      include: { user: true },
    });
    void this.audit.log({ userId, workspaceId, action: "workspace.member.role", entity: "workspace_member", entityId: memberId, metadata: { role } }).catch(() => undefined);
    return {
      id: updated.id,
      workspaceId,
      name: updated.user.name,
      email: updated.user.email,
      initials: this.initials(updated.user.name),
      role,
      joinedAt: updated.joinedAt.toISOString(),
      lastAccessAt: (updated.lastAccessAt ?? updated.joinedAt).toISOString(),
      isCurrentUser: updated.userId === userId,
    };
  }

  async removeMember(userId: string, workspaceId: string, memberId: string) {
    await this.requireOwner(userId, workspaceId);
    const member = await this.prisma.workspaceMember.findFirst({ where: { id: memberId, workspaceId } });
    if (!member) throw new NotFoundException("Participante não encontrado.");
    if (member.role === "OWNER") throw new ForbiddenException("O proprietário não pode ser removido.");
    await this.prisma.workspaceMember.delete({ where: { id: memberId } });
    void this.audit.log({ userId, workspaceId, action: "workspace.member.remove", entity: "workspace_member", entityId: memberId }).catch(() => undefined);
    return { message: "Participante removido." };
  }

  async invitations(userId: string, workspaceId: string) {
    await this.requireMembership(userId, workspaceId);
    await this.expireInvitations();
    const invitations = await this.prisma.workspaceInvitation.findMany({
      where: { workspaceId },
      include: { invitedBy: true },
      orderBy: { createdAt: "desc" },
    });
    return invitations.map((invitation) => this.mapInvitation(invitation));
  }

  async invite(userId: string, workspaceId: string, dto: InviteMemberDto) {
    await this.requireOwner(userId, workspaceId);
    const email = dto.email.trim().toLowerCase();
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, user: { email } },
    });
    if (existingMember) throw new ConflictException("Esta pessoa já participa do espaço.");
    const existingInvitation = await this.prisma.workspaceInvitation.findFirst({
      where: { workspaceId, email, status: "PENDING", expiresAt: { gt: new Date() } },
    });
    if (existingInvitation) throw new ConflictException("Já existe um convite pendente para este e-mail.");

    const rawToken = randomBytes(32).toString("hex");
    const invitation = await this.prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        role: dto.role.toUpperCase() as "EDITOR" | "VIEWER",
        tokenHash: this.hashToken(rawToken),
        invitedByUserId: userId,
        expiresAt: new Date(Date.now() + 7 * 86_400_000),
      },
      include: { invitedBy: true },
    });
    void this.audit.log({ userId, workspaceId, action: "workspace.invite.create", entity: "workspace_invitation", entityId: invitation.id, metadata: { email, role: dto.role } }).catch(() => undefined);
    return {
      ...this.mapInvitation(invitation),
      token: rawToken,
      invitationUrl: `${this.config.get<string>("FRONTEND_URL", "http://localhost:3000")}/convite/${rawToken}`,
    };
  }

  async resendInvitation(userId: string, workspaceId: string, invitationId: string) {
    await this.requireOwner(userId, workspaceId);
    const current = await this.prisma.workspaceInvitation.findFirst({ where: { id: invitationId, workspaceId } });
    if (!current) throw new NotFoundException("Convite não encontrado.");
    const rawToken = randomBytes(32).toString("hex");
    const invitation = await this.prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: {
        tokenHash: this.hashToken(rawToken),
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 86_400_000),
        createdAt: new Date(),
      },
      include: { invitedBy: true },
    });
    return {
      ...this.mapInvitation(invitation),
      token: rawToken,
      invitationUrl: `${this.config.get<string>("FRONTEND_URL", "http://localhost:3000")}/convite/${rawToken}`,
    };
  }

  async cancelInvitation(userId: string, workspaceId: string, invitationId: string) {
    await this.requireOwner(userId, workspaceId);
    await this.prisma.workspaceInvitation.updateMany({
      where: { id: invitationId, workspaceId },
      data: { status: "REVOKED" },
    });
    return { message: "Convite cancelado." };
  }

  async invitationDetails(rawToken: string) {
    await this.expireInvitations();
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
      include: { workspace: true, invitedBy: true },
    });
    if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt <= new Date()) {
      throw new NotFoundException("Convite inválido ou expirado.");
    }
    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role.toLowerCase(),
      invitedBy: invitation.invitedBy.name,
      expiresAt: invitation.expiresAt.toISOString(),
      workspace: {
        id: invitation.workspace.id,
        name: invitation.workspace.name,
        description: invitation.workspace.description ?? "",
      },
    };
  }

  async acceptInvitation(userId: string, rawToken: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
    });
    if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt <= new Date()) {
      throw new NotFoundException("Convite inválido ou expirado.");
    }
    if (invitation.email !== user.email) {
      throw new ForbiddenException("Entre com o mesmo e-mail que recebeu o convite.");
    }

    await this.prisma.$transaction([
      this.prisma.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId: invitation.workspaceId, userId } },
        update: { role: invitation.role, lastAccessAt: new Date() },
        create: { workspaceId: invitation.workspaceId, userId, role: invitation.role, lastAccessAt: new Date() },
      }),
      this.prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED", acceptedByUserId: userId, acceptedAt: new Date() },
      }),
    ]);
    return { message: "Convite aceito.", workspaceId: invitation.workspaceId };
  }

  private async requireMembership(userId: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!membership) throw new ForbiddenException("Você não possui acesso a este espaço.");
    return membership;
  }

  private async requireOwner(userId: string, workspaceId: string) {
    const membership = await this.requireMembership(userId, workspaceId);
    if (membership.role !== "OWNER") throw new ForbiddenException("Somente o proprietário pode administrar acessos.");
    return membership;
  }

  private async expireInvitations() {
    await this.prisma.workspaceInvitation.updateMany({
      where: { status: "PENDING", expiresAt: { lte: new Date() } },
      data: { status: "EXPIRED" },
    });
  }

  private mapWorkspace(workspace: { id: string; name: string; description: string | null; type: string; createdAt: Date; _count: { members: number } }, role: string, lastActivityAt: Date) {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description ?? "",
      kind: workspace.type.toLowerCase(),
      role: role.toLowerCase(),
      membersCount: workspace._count.members,
      createdAt: workspace.createdAt.toISOString(),
      lastActivityAt: lastActivityAt.toISOString(),
    };
  }

  private mapInvitation(invitation: { id: string; workspaceId: string; email: string; role: string; status: string; createdAt: Date; expiresAt: Date; invitedBy: { name: string } }) {
    return {
      id: invitation.id,
      workspaceId: invitation.workspaceId,
      email: invitation.email,
      role: invitation.role.toLowerCase(),
      invitedBy: invitation.invitedBy.name,
      sentAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
      status: invitation.status.toLowerCase(),
    };
  }

  private hashToken(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  private slugify(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "espaco";
  }

  private initials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  }
}
