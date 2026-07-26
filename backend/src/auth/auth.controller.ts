import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import type { FastifyReply, FastifyRequest } from "fastify";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import type { AuthenticatedUser } from "../common/types/authenticated-user";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "./auth.constants";
import { AuthService, RequestMetadata } from "./auth.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@ApiTags("Autenticação")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: "Cria usuário e espaço financeiro pessoal" })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.auth.register(dto, this.metadata(request));
    this.writeCookies(reply, result.tokens);
    return { user: result.user };
  }

  @Public()
  @Post("login")
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.auth.login(dto, this.metadata(request));
    this.writeCookies(reply, result.tokens);
    return { user: result.user };
  }

  @Public()
  @Post("refresh")
  async refresh(
    @Req() request: FastifyRequest & { cookies: Record<string, string> },
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const result = await this.auth.refresh(request.cookies?.[REFRESH_COOKIE], this.metadata(request));
    this.writeCookies(reply, result.tokens);
    return { user: result.user };
  }

  @Post("logout")
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.auth.logout(user.id, user.sessionId);
    this.clearCookies(reply);
    return { message: "Sessão encerrada." };
  }

  @Get("me")
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.getMe(user.id);
  }

  @Get("sessions")
  listSessions(@CurrentUser() user: AuthenticatedUser) {
    return this.auth.listSessions(user.id, user.sessionId);
  }

  @Delete("sessions/others")
  async revokeOtherSessions(@CurrentUser() user: AuthenticatedUser) {
    await this.auth.revokeOtherSessions(user.id, user.sessionId);
    return { message: "As outras sessões foram encerradas." };
  }

  @Delete("sessions/:sessionId")
  async revokeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param("sessionId") sessionId: string,
  ) {
    await this.auth.revokeSession(user.id, sessionId);
    return { message: "Sessão encerrada." };
  }

  @Public()
  @Post("forgot-password")
  @Throttle({ default: { limit: 4, ttl: 60_000 } })
  requestPasswordReset(@Body() dto: ForgotPasswordDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @Public()
  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Post("change-password")
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user.id, dto);
  }

  private writeCookies(
    reply: FastifyReply,
    tokens: { accessToken: string; refreshToken: string; accessExpiresInSeconds: number; refreshExpiresAt: Date },
  ) {
    const secure = this.config.get<boolean>("COOKIE_SECURE", false);
    reply.setCookie(ACCESS_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: tokens.accessExpiresInSeconds,
    });
    reply.setCookie(REFRESH_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/api/v1/auth",
      expires: tokens.refreshExpiresAt,
    });
  }

  private clearCookies(reply: FastifyReply) {
    reply.clearCookie(ACCESS_COOKIE, { path: "/" });
    reply.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
  }

  private metadata(request: FastifyRequest): RequestMetadata {
    return {
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    };
  }
}
