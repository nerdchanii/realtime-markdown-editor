import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  createPasswordCredential,
  verifyPasswordCredential,
} from "@/modules/identity/use-cases/password-credential.js";

test("password credentials store a salted hash instead of the raw password", () => {
  const first = createPasswordCredential("correct horse battery staple");
  const second = createPasswordCredential("correct horse battery staple");

  assert.notEqual(first.passwordSalt, second.passwordSalt);
  assert.notEqual(first.passwordHash, second.passwordHash);
  assert.notEqual(first.passwordHash, "correct horse battery staple");
  assert.equal(verifyPasswordCredential("correct horse battery staple", first), true);
  assert.equal(verifyPasswordCredential("wrong password", first), false);
});
