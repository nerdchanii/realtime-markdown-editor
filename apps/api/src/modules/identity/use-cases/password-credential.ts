import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const passwordSaltBytes = 16;
const passwordKeyLength = 64;

export type PasswordCredential = Readonly<{
  passwordHash: string;
  passwordSalt: string;
}>;

export function createPasswordCredential(password: string): PasswordCredential {
  const passwordSalt = randomBytes(passwordSaltBytes).toString("base64url");

  return {
    passwordHash: hashPassword(password, passwordSalt),
    passwordSalt,
  };
}

export function verifyPasswordCredential(
  password: string,
  credential: PasswordCredential,
): boolean {
  const actual = Buffer.from(hashPassword(password, credential.passwordSalt), "hex");
  const expected = Buffer.from(credential.passwordHash, "hex");
  if (actual.length !== expected.length) return false;

  return timingSafeEqual(actual, expected);
}

function hashPassword(password: string, passwordSalt: string): string {
  return scryptSync(password, passwordSalt, passwordKeyLength).toString("hex");
}
