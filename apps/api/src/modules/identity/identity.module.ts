import { Module } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import { PrismaAuthSessionRepository } from "@/modules/identity/adapters/prisma-auth-session-repository.js";
import { AuthSessionController } from "@/modules/identity/interfaces/auth-session.controller.js";
import {
  AuthSessionService,
  type AuthSessionRepository,
} from "@/modules/identity/use-cases/auth-session-service.js";

export const AUTH_SESSION_REPOSITORY = Symbol("AUTH_SESSION_REPOSITORY");

@Module({
  controllers: [AuthSessionController],
  providers: [
    {
      provide: AUTH_SESSION_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) => new PrismaAuthSessionRepository(database),
      inject: [PrismaDatabaseService],
    },
    {
      provide: AuthSessionService,
      useFactory: (repository: AuthSessionRepository) => new AuthSessionService(repository),
      inject: [AUTH_SESSION_REPOSITORY],
    },
  ],
  exports: [AuthSessionService],
})
export class IdentityModule {}
