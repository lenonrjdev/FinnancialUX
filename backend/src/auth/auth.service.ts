import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { compare, hash } from "bcryptjs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { JwtPayload } from "../common/types/authenticated-user";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

export type RequestMetadata = {
  ipAddress?: string;
  userAgent?: string;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  accessExpiresInSeconds: number;
  refreshExpiresAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  async register(dto: RegisterDto, metadata: RequestMetadata) {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) throw new ConflictException("Já existe uma conta com este e-mail.");

    const passwordHash = await hash(dto.password, 12);
    const slugBase = this.slugify(dto.name) || "espaco-pessoal";
    const slug = `${slugBase}-${randomBytes(3).toString("hex")}`;

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: dto.name.trim(),
          email,
          passwordHash,
          emailVerifiedAt: new Date(),
          preferences: { create: {} },
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          ownerUserId: created.id,
          name: "Meu espaço pessoal",
          slug,
          description: `Organização financeira pessoal de ${created.name}.`,
          type: "PERSONAL",
          members: {
            create: { userId: created.id, role: "OWNER", lastAccessAt: new Date() },
          },
        },
      });

      await tx.userPreferences.update({
        where: { userId: created.id },
        data: { defaultWorkspaceId: workspace.id },
      });

      return created;
    });

    const tokens = await this.createSession(user.id, metadata);
    void this.audit.log({
      userId: user.id,
      action: "auth.register",
      entity: "user",
      entityId: user.id,
      ...metadata,
    }).catch(() => undefined);

    return { user: await this.getMe(user.id), tokens };
  }

  async login(dto: LoginDto, metadata: RequestMetadata) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== "ACTIVE" || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.createSession(user.id, metadata, dto.remember !== false);
    void this.audit.log({
      userId: user.id,
      action: "auth.login",
      entity: "session",
      ...metadata,
    }).catch(() => undefined);

    return { user: await this.getMe(user.id), tokens };
  }

  async refresh(rawRefreshToken: string | undefined, metadata: RequestMetadata) {
    if (!rawRefreshToken) throw new UnauthorizedException("Token de renovação ausente.");

    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(rawRefreshToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Sessão expirada.");
    }

    if (payload.type !== "refresh") throw new UnauthorizedException("Token inválido.");

    const session = await this.prisma.userSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: { status: "ACTIVE" },
      },
      include: { user: true },
    });

    if (!session || session.refreshTokenHash !== this.hashToken(rawRefreshToken)) {
      throw new UnauthorizedException("Sessão inválida ou revogada.");
    }

    const tokens = await this.rotateSession(session.id, session.userId, metadata);
    return { user: await this.getMe(session.userId), tokens };
  }

  async logout(userId: string, sessionId: string) {
    await this.prisma.userSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    void this.audit.log({ userId, action: "auth.logout", entity: "session", entityId: sessionId }).catch(() => undefined);
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.userSession.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });
  }

  async revokeOtherSessions(userId: string, currentSessionId: string) {
    await this.prisma.userSession.updateMany({
      where: { userId, id: { not: currentSessionId }, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async listSessions(userId: string, currentSessionId: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: "desc" },
    });
    return sessions.map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
      current: session.id === currentSessionId,
    }));
  }

  async requestPasswordReset(emailValue: string) {
    const email = emailValue.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: "Se a conta existir, a recuperação foi preparada." };

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const rawToken = randomBytes(32).toString("hex");
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(rawToken),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    return {
      message: "Recuperação preparada. Em ambiente local, use o token retornado.",
      ...(this.config.get<string>("NODE_ENV") !== "production" ? { resetToken: rawToken } : {}),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.hashToken(dto.token) },
    });
    if (!token || token.usedAt || token.expiresAt <= new Date()) {
      throw new UnauthorizedException("Token inválido ou expirado.");
    }

    const passwordHash = await hash(dto.password, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
      this.prisma.userSession.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: "Senha alterada com sucesso." };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await compare(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException("A senha atual não confere.");
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await hash(dto.newPassword, 12) },
    });
    return { message: "Senha alterada com sucesso." };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        preferences: true,
        memberships: {
          where: { workspace: { archivedAt: null } },
          include: { workspace: { include: { _count: { select: { members: true } } } } },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      initials: this.initials(user.name),
      locale: user.locale,
      timezone: user.timezone,
      preferences: user.preferences
        ? {
            appearance: user.preferences.appearance.toLowerCase(),
            defaultWorkspaceId: user.preferences.defaultWorkspaceId,
            hideBalancesOnOpen: user.preferences.hideBalancesOnOpen,
            compactLargeValues: user.preferences.compactLargeValues,
          }
        : null,
      workspaces: user.memberships.map(({ role, joinedAt, lastAccessAt, workspace }) => ({
        id: workspace.id,
        name: workspace.name,
        description: workspace.description ?? "",
        kind: workspace.type.toLowerCase(),
        role: role.toLowerCase(),
        membersCount: workspace._count.members,
        createdAt: workspace.createdAt.toISOString(),
        lastActivityAt: (lastAccessAt ?? joinedAt).toISOString(),
      })),
    };
  }

  private async createSession(
    userId: string,
    metadata: RequestMetadata,
    remember = true,
  ): Promise<TokenPair> {
    const sessionId = randomUUID();
    const refreshDays = remember
      ? this.config.get<number>("JWT_REFRESH_TTL_DAYS", 30)
      : 1;
    const refreshExpiresAt = new Date(Date.now() + refreshDays * 86_400_000);
    const tokens = await this.signTokens(userId, sessionId, refreshExpiresAt);

    await this.prisma.userSession.create({
      data: {
        id: sessionId,
        userId,
        refreshTokenHash: this.hashToken(tokens.refreshToken),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt: refreshExpiresAt,
      },
    });
    return tokens;
  }

  private async rotateSession(sessionId: string, userId: string, metadata: RequestMetadata): Promise<TokenPair> {
    const refreshDays = this.config.get<number>("JWT_REFRESH_TTL_DAYS", 30);
    const refreshExpiresAt = new Date(Date.now() + refreshDays * 86_400_000);
    const tokens = await this.signTokens(userId, sessionId, refreshExpiresAt);
    await this.prisma.userSession.update({
      where: { id: sessionId },
      data: {
        refreshTokenHash: this.hashToken(tokens.refreshToken),
        expiresAt: refreshExpiresAt,
        lastUsedAt: new Date(),
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
      },
    });
    return tokens;
  }

  private async signTokens(userId: string, sessionId: string, refreshExpiresAt: Date): Promise<TokenPair> {
    const accessExpiresInSeconds = this.config.get<number>("JWT_ACCESS_TTL_SECONDS", 900);
    const accessPayload: JwtPayload = { sub: userId, sessionId, type: "access" };
    const refreshPayload: JwtPayload = { sub: userId, sessionId, type: "refresh" };
    const refreshSeconds = Math.max(60, Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000));
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: accessExpiresInSeconds,
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: refreshSeconds,
      }),
    ]);
    return { accessToken, refreshToken, accessExpiresInSeconds, refreshExpiresAt };
  }

  private hashToken(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  private slugify(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  private initials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  }
}
