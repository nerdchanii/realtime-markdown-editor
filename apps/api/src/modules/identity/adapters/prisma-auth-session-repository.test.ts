import { strict as assert } from "node:assert";
import { test } from "node:test";

import { PrismaAuthSessionRepository } from "@/modules/identity/adapters/prisma-auth-session-repository.js";
import { createPasswordCredential } from "@/modules/identity/use-cases/password-credential.js";

test("PrismaAuthSessionRepository rejects an invalid password without creating a session", async () => {
  const credential = createPasswordCredential("correct-password");
  const database = new FakeAuthSessionDatabase({
    id: "user_alice",
    email: "alice@example.test",
    name: "Alice",
    passwordHash: credential.passwordHash,
    passwordSalt: credential.passwordSalt,
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
  });
  const repository = new PrismaAuthSessionRepository(database as never);

  const session = await repository.createSession({
    email: "alice@example.test",
    password: "wrong-password",
    workspaceId: "workspace_review" as never,
  });

  assert.equal(session, null);
  assert.equal(database.createdSessionCount, 0);
});

type StoredAuthUser = Readonly<{
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

class FakeAuthSessionDatabase {
  createdSessionCount = 0;

  constructor(private readonly storedUser: StoredAuthUser | null) {}

  readonly user = {
    findUnique: async ({ where }: { where: { email: string } }) => {
      if (this.storedUser?.email !== where.email) return null;
      return this.storedUser;
    },
  };

  readonly session = {
    create: async () => {
      this.createdSessionCount += 1;
      return {};
    },
  };
}
