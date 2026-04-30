import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import type { CreateSessionRequestDto, EmptyResponseDto, SessionResponseDto } from "@rme/contracts";

import {
  AuthSessionService,
  createSessionCookie,
  expireSessionCookie,
  sessionDtoFromContext,
} from "@/modules/identity/use-cases/auth-session-service.js";

type CookieResponse = {
  setHeader(name: "Set-Cookie", value: string): void;
};

@Controller("auth")
export class AuthSessionController {
  constructor(
    @Inject(AuthSessionService)
    private readonly authSessions: AuthSessionService,
  ) {}

  @Post("session")
  async createSession(
    @Body() body: CreateSessionRequestDto,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<SessionResponseDto> {
    const session = await this.authSessions.createSession(body);
    if (!session) throw new UnauthorizedException("Session could not be created.");

    response.setHeader("Set-Cookie", createSessionCookie(session.token, session.expiresAt));
    return { session: sessionDtoFromContext(session.context) };
  }

  @Get("session")
  async getSession(@Headers("cookie") cookieHeader?: string): Promise<SessionResponseDto> {
    const session = await this.authSessions.resolveSession(cookieHeader);
    if (!session) throw new UnauthorizedException("Authentication is required.");

    return { session: sessionDtoFromContext(session) };
  }

  @Delete("session")
  async deleteSession(
    @Headers("cookie") cookieHeader: string | undefined,
    @Res({ passthrough: true }) response: CookieResponse,
  ): Promise<EmptyResponseDto> {
    await this.authSessions.revokeSession(cookieHeader);
    response.setHeader("Set-Cookie", expireSessionCookie());
    return {};
  }
}
