import { strict as assert } from "node:assert";
import { test } from "node:test";

import type { WorkspaceId } from "@/modules/identity/domain/workspace-membership.js";
import type { UserId, WorkspaceMembershipId } from "@rme/contracts";
import {
  AuthSessionService,
  createSessionCookie,
  expireSessionCookie,
  type AuthSessionRepository,
  type SessionContext,
} from "@/modules/identity/use-cases/auth-session-service.js";

const baseSession = {
  user: {
    id: "user_alice" as UserId,
    email: "alice@example.test",
    name: "Alice",
  },
  memberships: [
    {
      id: "member_alice" as WorkspaceMembershipId,
      userId: "user_alice" as UserId,
      workspaceId: "workspace_review" as WorkspaceId,
      displayName: "Alice",
      color: "#0969da",
      role: "owner",
    },
  ],
  currentMembership: {
    id: "member_alice" as WorkspaceMembershipId,
    userId: "user_alice" as UserId,
    workspaceId: "workspace_review" as WorkspaceId,
    displayName: "Alice",
    color: "#0969da",
    role: "owner",
  },
} as const satisfies SessionContext;

test("auth session service creates DB-backed session context by user email and workspace", async () => {
  const repository = new FakeAuthSessionRepository({
    created: {
      token: "session_token",
      expiresAt: new Date("2026-05-07T00:00:00.000Z"),
      context: baseSession,
    },
  });
  const service = new AuthSessionService(repository);

  const session = await service.createSession({
    email: "Alice@Example.Test ",
    workspaceId: "workspace_review" as WorkspaceId,
  });

  assert.equal(repository.createInput?.email, "alice@example.test");
  assert.equal(repository.createInput?.workspaceId, "workspace_review");
  assert.equal(session?.token, "session_token");
  assert.equal(session?.context.currentMembership?.id, "member_alice");
});

test("auth session service resolves and revokes sessions from the session cookie token", async () => {
  const repository = new FakeAuthSessionRepository({
    resolved: baseSession,
  });
  const service = new AuthSessionService(repository);

  const resolved = await service.resolveSession("rme_session=session_token; theme=dark");
  const revoked = await service.revokeSession("rme_session=session_token; theme=dark");

  assert.equal(repository.resolvedToken, "session_token");
  assert.equal(repository.revokedToken, "session_token");
  assert.equal(resolved?.user.id, "user_alice");
  assert.equal(revoked, true);
});

test("auth session service treats malformed cookie encoding as an absent session", async () => {
  const repository = new FakeAuthSessionRepository({
    resolved: baseSession,
  });
  const service = new AuthSessionService(repository);

  const resolved = await service.resolveSession("rme_session=%; theme=dark");

  assert.equal(repository.resolvedToken, null);
  assert.equal(resolved, null);
});

test("session cookies are httpOnly and scoped to the API path", () => {
  assert.equal(
    createSessionCookie("session_token", new Date("2026-05-07T00:00:00.000Z")),
    "rme_session=session_token; HttpOnly; Path=/; SameSite=Lax; Expires=Thu, 07 May 2026 00:00:00 GMT",
  );
  assert.equal(expireSessionCookie(), "rme_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0");
});

class FakeAuthSessionRepository implements AuthSessionRepository {
  createInput: Readonly<{
    email: string;
    workspaceId: WorkspaceId | null;
  }> | null = null;
  resolvedToken: string | null = null;
  revokedToken: string | null = null;

  constructor(
    private readonly result: Readonly<{
      created?: Awaited<ReturnType<AuthSessionRepository["createSession"]>>;
      resolved?: SessionContext | null;
      revoked?: boolean;
    }>,
  ) {}

  async createSession(input: {
    email: string;
    workspaceId: WorkspaceId | null;
  }): Promise<Awaited<ReturnType<AuthSessionRepository["createSession"]>>> {
    this.createInput = input;
    return this.result.created ?? null;
  }

  async findSessionByToken(token: string): Promise<SessionContext | null> {
    this.resolvedToken = token;
    return this.result.resolved ?? null;
  }

  async revokeSessionByToken(token: string): Promise<boolean> {
    this.revokedToken = token;
    return this.result.revoked ?? true;
  }
}
