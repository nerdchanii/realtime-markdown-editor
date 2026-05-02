import { createHash, randomBytes, randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import type {
  AuthSessionRepository,
  CreatedSession,
  SessionContext,
} from "@/modules/identity/use-cases/auth-session-service.js";
import type { WorkspaceId } from "@/modules/identity/domain/workspace-membership.js";
import type { UserId, WorkspaceMembershipId } from "@rme/contracts";
import { verifyPasswordCredential } from "@/modules/identity/use-cases/password-credential.js";

const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class PrismaAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly database: PrismaDatabaseService) {}

  async createSession(input: {
    email: string;
    password: string;
    workspaceId: WorkspaceId | null;
  }): Promise<CreatedSession | null> {
    const user = await this.database.user.findUnique({
      where: { email: input.email },
      include: { memberships: { where: { removedAt: null }, orderBy: { createdAt: "asc" } } },
    });
    if (!user) return null;
    if (!isValidPassword(input.password, user)) return null;

    const currentMembership = selectCurrentMembership(user.memberships, input.workspaceId);
    if (isMissingRequestedWorkspaceMembership(input.workspaceId, currentMembership)) return null;

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + sessionTtlMs);
    await this.createDatabaseSession(token, user.id, currentMembership?.id ?? null, expiresAt);

    return {
      token,
      expiresAt,
      context: sessionContextFromUser(user, currentMembership?.id ?? null),
    };
  }

  private async createDatabaseSession(
    token: string,
    userId: string,
    currentMembershipId: string | null,
    expiresAt: Date,
  ): Promise<void> {
    await this.database.session.create({
      data: {
        id: `session_${randomUUID()}`,
        tokenHash: hashSessionToken(token),
        userId,
        currentMembershipId,
        expiresAt,
      },
    });
  }

  async findSessionByToken(token: string): Promise<SessionContext | null> {
    const session = await this.database.session.findUnique({
      where: { tokenHash: hashSessionToken(token) },
      include: {
        user: {
          include: { memberships: { where: { removedAt: null }, orderBy: { createdAt: "asc" } } },
        },
      },
    });
    if (!session || session.status !== "active" || session.expiresAt <= new Date()) return null;

    return sessionContextFromUser(session.user, session.currentMembershipId);
  }

  async revokeSessionByToken(token: string): Promise<boolean> {
    const result = await this.database.session.updateMany({
      where: { tokenHash: hashSessionToken(token), status: "active" },
      data: {
        status: "revoked",
        revokedAt: new Date(),
      },
    });
    return result.count > 0;
  }
}

function isValidPassword(password: string, user: UserWithMemberships): boolean {
  return verifyPasswordCredential(password, {
    passwordHash: user.passwordHash,
    passwordSalt: user.passwordSalt,
  });
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

type UserWithMemberships = Readonly<{
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  passwordSalt: string;
  memberships: Array<{
    id: string;
    userId: string;
    workspaceId: string;
    displayName: string;
    color: string;
    role: "owner" | "member";
  }>;
}>;

function selectCurrentMembership(
  memberships: UserWithMemberships["memberships"],
  workspaceId: WorkspaceId | null,
): UserWithMemberships["memberships"][number] | null {
  if (workspaceId === null) return memberships[0] ?? null;
  return memberships.find((membership) => membership.workspaceId === workspaceId) ?? null;
}

function isMissingRequestedWorkspaceMembership(
  workspaceId: WorkspaceId | null,
  membership: UserWithMemberships["memberships"][number] | null,
) {
  return workspaceId !== null && !membership;
}

function sessionContextFromUser(
  user: UserWithMemberships,
  currentMembershipId: string | null,
): SessionContext {
  const memberships = user.memberships.map((membership) => ({
    id: membership.id as WorkspaceMembershipId,
    userId: membership.userId as UserId,
    workspaceId: membership.workspaceId as WorkspaceId,
    displayName: membership.displayName,
    color: membership.color,
    role: memberRoleToDto(membership.role),
  }));

  return {
    user: {
      id: user.id as UserId,
      email: user.email,
      name: user.name,
    },
    memberships,
    currentMembership:
      memberships.find((membership) => membership.id === currentMembershipId) ??
      (currentMembershipId ? null : (memberships[0] ?? null)),
  };
}

function memberRoleToDto(role: "owner" | "member"): "owner" | "editor" {
  return role === "owner" ? "owner" : "editor";
}
