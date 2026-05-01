import type {
  CreateSessionRequestDto,
  SessionDto,
  UserDto,
  WorkspaceId,
  WorkspaceMemberDto,
  WorkspaceMembershipId,
} from "@rme/contracts";

export const sessionCookieName = "rme_session";

export type AuthenticatedUser = UserDto;
export type AuthenticatedMembership = WorkspaceMemberDto;

export type SessionContext = Readonly<{
  user: AuthenticatedUser;
  memberships: readonly AuthenticatedMembership[];
  currentMembership: AuthenticatedMembership | null;
}>;

export type CreatedSession = Readonly<{
  token: string;
  expiresAt: Date;
  context: SessionContext;
}>;

export interface AuthSessionRepository {
  createSession(input: {
    email: string;
    password: string;
    workspaceId: WorkspaceId | null;
  }): Promise<CreatedSession | null>;
  findSessionByToken(token: string): Promise<SessionContext | null>;
  revokeSessionByToken(token: string): Promise<boolean>;
}

export class AuthSessionService {
  constructor(private readonly sessions: AuthSessionRepository) {}

  async createSession(input: CreateSessionRequestDto): Promise<CreatedSession | null> {
    return this.sessions.createSession({
      email: normalizeEmail(input.email),
      password: input.password,
      workspaceId: input.workspaceId ?? null,
    });
  }

  async resolveSession(cookieHeader: string | undefined): Promise<SessionContext | null> {
    const token = sessionTokenFromCookieHeader(cookieHeader);
    if (!token) return null;
    return this.sessions.findSessionByToken(token);
  }

  async revokeSession(cookieHeader: string | undefined): Promise<boolean> {
    const token = sessionTokenFromCookieHeader(cookieHeader);
    if (!token) return false;
    return this.sessions.revokeSessionByToken(token);
  }
}

export function sessionDtoFromContext(context: SessionContext): SessionDto {
  return {
    user: context.user,
    memberships: context.memberships,
    currentMembership: context.currentMembership,
  };
}

export function createSessionCookie(token: string, expiresAt: Date): string {
  return [
    `${sessionCookieName}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`,
  ].join("; ");
}

export function expireSessionCookie(): string {
  return [`${sessionCookieName}=`, "HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"].join("; ");
}

export function sessionTokenFromCookieHeader(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  for (const pair of cookieHeader.split(";")) {
    const [name, ...valueParts] = pair.trim().split("=");
    if (name !== sessionCookieName) continue;
    const value = valueParts.join("=");
    return value.length > 0 ? decodeCookieValue(value) : null;
  }
  return null;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function currentMembershipId(context: SessionContext): WorkspaceMembershipId | null {
  return context.currentMembership?.id ?? null;
}

function decodeCookieValue(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
