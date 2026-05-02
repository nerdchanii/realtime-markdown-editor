import type { UserDto } from "@rme/contracts";

import type { PasswordCredential } from "@/modules/identity/use-cases/password-credential.js";

export const ACCOUNT_REPOSITORY = Symbol("ACCOUNT_REPOSITORY");

export interface AccountRepository {
  createAccount(input: {
    email: string;
    name: string;
    passwordCredential: PasswordCredential;
  }): Promise<UserDto | null>;
}
