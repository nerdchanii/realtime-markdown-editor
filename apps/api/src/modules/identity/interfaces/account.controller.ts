import { Body, ConflictException, Controller, Headers, Inject, Patch, Post } from "@nestjs/common";
import type {
  CreateAccountRequestDto,
  UpdateAccountProfileRequestDto,
  UserResponseDto,
} from "@rme/contracts";

import { AccountService } from "@/modules/identity/use-cases/account-service.js";
import { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";

@Controller("accounts")
export class AccountController {
  constructor(
    @Inject(AccountService)
    private readonly accounts: AccountService,
    @Inject(ProductApiAccessService)
    private readonly access: ProductApiAccessService,
  ) {}

  @Post()
  async createAccount(@Body() body: CreateAccountRequestDto): Promise<UserResponseDto> {
    const user = await this.accounts.createAccount(body);
    if (!user) throw new ConflictException("Account email is already registered.");

    return { user };
  }

  @Patch("me/profile")
  async updateCurrentProfile(
    @Body() body: UpdateAccountProfileRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<UserResponseDto> {
    const session = await this.access.requireSession(cookieHeader);
    return { user: await this.accounts.updateAccountProfile(session.user.id, body) };
  }
}
