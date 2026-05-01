import { strict as assert } from "node:assert";
import { test } from "node:test";

import { UnauthorizedException } from "@nestjs/common";
import type { UserId, WorkspaceId, WorkspaceMembershipId } from "@rme/contracts";

import { AuthSessionController } from "@/modules/identity/interfaces/auth-session.controller.js";
import {
  AuthSessionService,
  type AuthSessionRepository,
  type SessionContext,
} from "@/modules/identity/use-cases/auth-session-service.js";

const sessionContext = {
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

test("auth session controller creates httpOnly session cookies", async () => {
  const controller = new AuthSessionController(
    new AuthSessionService(
      new FakeAuthSessionRepository({
        created: {
          token: "session_token",
          expiresAt: new Date("2026-05-07T00:00:00.000Z"),
          context: sessionContext,
        },
      }),
    ),
  );
  const response = new FakeCookieResponse();

  const body = await controller.createSession(
    {
      email: "alice@example.test",
      password: "any-local-password",
      workspaceId: "workspace_review" as WorkspaceId,
    },
    response,
  );

  assert.equal(body.session.currentMembership?.id, "member_alice");
  assert.match(response.cookie ?? "", /HttpOnly/);
});

test("auth session controller resolves current user from the session cookie", async () => {
  const controller = new AuthSessionController(
    new AuthSessionService(new FakeAuthSessionRepository({ resolved: sessionContext })),
  );

  const body = await controller.getSession("rme_session=session_token");

  assert.equal(body.session.user.email, "alice@example.test");
  assert.equal(body.session.currentMembership?.id, "member_alice");
});

test("auth session controller rejects missing session cookies", async () => {
  const controller = new AuthSessionController(
    new AuthSessionService(new FakeAuthSessionRepository({ resolved: null })),
  );

  await assert.rejects(() => controller.getSession(undefined), UnauthorizedException);
});

class FakeCookieResponse {
  cookie: string | null = null;

  setHeader(name: "Set-Cookie", value: string): void {
    assert.equal(name, "Set-Cookie");
    this.cookie = value;
  }
}

class FakeAuthSessionRepository implements AuthSessionRepository {
  constructor(
    private readonly result: Readonly<{
      created?: Awaited<ReturnType<AuthSessionRepository["createSession"]>>;
      resolved?: SessionContext | null;
    }>,
  ) {}

  async createSession(): Promise<Awaited<ReturnType<AuthSessionRepository["createSession"]>>> {
    return this.result.created ?? null;
  }

  async findSessionByToken(): Promise<SessionContext | null> {
    return this.result.resolved ?? null;
  }

  async revokeSessionByToken(): Promise<boolean> {
    return true;
  }
}
