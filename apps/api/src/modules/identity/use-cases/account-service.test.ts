import { strict as assert } from "node:assert";
import { test } from "node:test";

import { BadRequestException } from "@nestjs/common";
import type { UserId } from "@rme/contracts";

import type { AccountRepository } from "@/modules/identity/ports/account-repository.js";
import { AccountService } from "@/modules/identity/use-cases/account-service.js";
import { verifyPasswordCredential } from "@/modules/identity/use-cases/password-credential.js";

test("account service creates normalized local product accounts", async () => {
  const repository = new FakeAccountRepository();
  const service = new AccountService(repository);

  const user = await service.createAccount({
    email: " Alice@Example.Test ",
    name: " Alice ",
    password: "password123",
  });

  assert.equal(user?.email, "alice@example.test");
  assert.equal(user?.name, "Alice");
  assert.equal(repository.created?.email, "alice@example.test");
  assert.equal(repository.created?.name, "Alice");
  assert.equal(
    repository.created
      ? verifyPasswordCredential("password123", repository.created.passwordCredential)
      : false,
    true,
  );
});

test("account service rejects incomplete account creation requests", async () => {
  const service = new AccountService(new FakeAccountRepository());

  await assert.rejects(
    () => service.createAccount({ email: "alice@example.test", name: "", password: "short" }),
    BadRequestException,
  );
});

test("account service updates current user profile names", async () => {
  const repository = new FakeAccountRepository();
  const service = new AccountService(repository);

  const user = await service.updateAccountProfile("user_created" as UserId, { name: " Ada " });

  assert.equal(user.name, "Ada");
  assert.equal(repository.updated?.userId, "user_created");
  assert.deepEqual(repository.updated?.input, { name: "Ada" });
});

class FakeAccountRepository implements AccountRepository {
  created: Parameters<AccountRepository["createAccount"]>[0] | null = null;
  updated: {
    userId: UserId;
    input: Parameters<AccountRepository["updateAccountProfile"]>[1];
  } | null = null;

  async createAccount(
    input: Parameters<AccountRepository["createAccount"]>[0],
  ): Promise<Awaited<ReturnType<AccountRepository["createAccount"]>>> {
    this.created = input;
    return {
      id: "user_created" as UserId,
      email: input.email,
      name: input.name,
    };
  }

  async updateAccountProfile(
    userId: UserId,
    input: Parameters<AccountRepository["updateAccountProfile"]>[1],
  ): Promise<Awaited<ReturnType<AccountRepository["updateAccountProfile"]>>> {
    this.updated = { userId, input };
    return {
      id: userId,
      email: "created@example.test",
      name: input.name ?? "Created User",
    };
  }
}
