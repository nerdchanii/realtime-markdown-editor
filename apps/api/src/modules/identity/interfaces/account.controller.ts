import { Body, ConflictException, Controller, Inject, Post } from "@nestjs/common";
import type { CreateAccountRequestDto, UserResponseDto } from "@rme/contracts";

import { AccountService } from "@/modules/identity/use-cases/account-service.js";

@Controller("accounts")
export class AccountController {
  constructor(
    @Inject(AccountService)
    private readonly accounts: AccountService,
  ) {}

  @Post()
  async createAccount(@Body() body: CreateAccountRequestDto): Promise<UserResponseDto> {
    const user = await this.accounts.createAccount(body);
    if (!user) throw new ConflictException("Account email is already registered.");

    return { user };
  }
}
