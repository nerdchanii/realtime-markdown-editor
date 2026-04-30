import "reflect-metadata";

import { createHash } from "node:crypto";
import { strict as assert } from "node:assert";
import { test } from "node:test";

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { DatabaseModule } from "@/database/database.module.js";
import { PrismaDatabaseService } from "@/database/database.service.js";
import { IdentityModule } from "@/modules/identity/identity.module.js";
import {
  AuthSessionService,
  sessionCookieName,
} from "@/modules/identity/use-cases/auth-session-service.js";

@Module({ imports: [DatabaseModule, IdentityModule] })
class IdentityModuleSmokeTestModule {}

test("identity module injects Prisma database into auth session repository", async () => {
  const app = await NestFactory.createApplicationContext(IdentityModuleSmokeTestModule, {
    logger: false,
  });
  const database = app.get(PrismaDatabaseService);
  installFakeAuthSessionDatabase(database);

  try {
    const authSessions = app.get(AuthSessionService);
    const session = await authSessions.resolveSession(`${sessionCookieName}=session_token`);

    assert.equal(session?.user.id, "user_alice");
    assert.equal(session?.currentMembership?.id, "member_alice");
  } finally {
    await app.close();
  }
});

function installFakeAuthSessionDatabase(database: PrismaDatabaseService): void {
  Object.defineProperty(database, "session", {
    value: {
      findUnique: async (query: { where: { tokenHash: string } }) => {
        assert.equal(query.where.tokenHash, hashSessionToken("session_token"));

        return {
          id: "session_alice",
          tokenHash: query.where.tokenHash,
          userId: "user_alice",
          currentMembershipId: "member_alice",
          status: "active",
          expiresAt: new Date("2099-01-01T00:00:00.000Z"),
          user: {
            id: "user_alice",
            email: "alice@example.test",
            name: "Alice",
            memberships: [
              {
                id: "member_alice",
                userId: "user_alice",
                workspaceId: "workspace_review",
                displayName: "Alice",
                color: "#0969da",
                role: "owner",
              },
            ],
          },
        };
      },
    },
  });
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
