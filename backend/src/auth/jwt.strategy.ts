import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { FastifyRequest } from "fastify";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { AuthenticatedUser, JwtPayload } from "../common/types/authenticated-user";
import { PrismaService } from "../database/prisma.service";
import { ACCESS_COOKIE } from "./auth.constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: FastifyRequest & { cookies?: Record<string, string> }) =>
          request?.cookies?.[ACCESS_COOKIE] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (payload.type !== "access") {
      throw new UnauthorizedException("Token inválido.");
    }

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

    if (!session) {
      throw new UnauthorizedException("Sessão expirada ou revogada.");
    }

    return {
      id: session.user.id,
      sessionId: session.id,
      name: session.user.name,
      email: session.user.email,
    };
  }
}
