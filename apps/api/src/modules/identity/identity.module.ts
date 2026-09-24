import { Module } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import { PrismaAccountRepository } from "@/modules/identity/adapters/prisma-account-repository.js";
import { PrismaAuthSessionRepository } from "@/modules/identity/adapters/prisma-auth-session-repository.js";
import {
  PrismaProductResourceAccessRepository,
  type PrismaProductResourceAccessPersistenceClient,
} from "@/modules/identity/adapters/prisma-product-resource-access-repository.js";
import { AccountController } from "@/modules/identity/interfaces/account.controller.js";
import { AuthSessionController } from "@/modules/identity/interfaces/auth-session.controller.js";
import {
  ACCOUNT_REPOSITORY,
  type AccountRepository,
} from "@/modules/identity/ports/account-repository.js";
import { PRODUCT_RESOURCE_ACCESS_REPOSITORY } from "@/modules/identity/ports/product-resource-access-repository.js";
import { AccountService } from "@/modules/identity/use-cases/account-service.js";
import {
  AuthSessionService,
  type AuthSessionRepository,
} from "@/modules/identity/use-cases/auth-session-service.js";
import { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";

export const AUTH_SESSION_REPOSITORY = Symbol("AUTH_SESSION_REPOSITORY");

@Module({
  controllers: [AccountController, AuthSessionController],
  providers: [
    {
      provide: ACCOUNT_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) => new PrismaAccountRepository(database),
      inject: [PrismaDatabaseService],
    },
    {
      provide: AUTH_SESSION_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) => new PrismaAuthSessionRepository(database),
      inject: [PrismaDatabaseService],
    },
    {
      provide: PRODUCT_RESOURCE_ACCESS_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) =>
        new PrismaProductResourceAccessRepository(
          database as unknown as PrismaProductResourceAccessPersistenceClient,
        ),
      inject: [PrismaDatabaseService],
    },
    {
      provide: AuthSessionService,
      useFactory: (repository: AuthSessionRepository) => new AuthSessionService(repository),
      inject: [AUTH_SESSION_REPOSITORY],
    },
    {
      provide: AccountService,
      useFactory: (repository: AccountRepository) => new AccountService(repository),
      inject: [ACCOUNT_REPOSITORY],
    },
    ProductApiAccessService,
  ],
  exports: [AccountService, AuthSessionService, ProductApiAccessService],
})
export class IdentityModule {}
