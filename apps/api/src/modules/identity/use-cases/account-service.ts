import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { CreateAccountRequestDto, UserDto } from "@rme/contracts";

import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from "@/modules/identity/ports/account-repository.js";
import { createPasswordCredential } from "@/modules/identity/use-cases/password-credential.js";
import { normalizeEmail } from "@/modules/identity/use-cases/auth-session-service.js";

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accounts: AccountRepository,
  ) {}

  async createAccount(input: CreateAccountRequestDto): Promise<UserDto | null> {
    const account = normalizeCreateAccountInput(input);
    return this.accounts.createAccount({
      email: account.email,
      name: account.name,
      passwordCredential: createPasswordCredential(account.password),
    });
  }
}

function normalizeCreateAccountInput(input: CreateAccountRequestDto) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const password = input.password;
  if (!email || !name || password.length < 8) {
    throw new BadRequestException("Account email, name, and password are required.");
  }
  return { email, name, password };
}
