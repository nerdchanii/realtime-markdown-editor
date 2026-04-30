import { Module } from "@nestjs/common";

import { PrismaCollaborationSessionRepository } from "@/modules/collaboration/adapters/prisma-collaboration-session-repository.js";
import { SeedCollaborationSessionRepository } from "@/modules/collaboration/adapters/seed-collaboration-session-repository.js";
import { CollaborationSessionController } from "@/modules/collaboration/interfaces/collaboration-session.controller.js";
import { DocumentCollaborationSessionController } from "@/modules/collaboration/interfaces/document-collaboration-session.controller.js";
import { DocumentsModule } from "@/modules/documents/documents.module.js";
import { IdentityModule } from "@/modules/identity/identity.module.js";
import {
  COLLABORATION_SESSION_REPOSITORY,
  type CollaborationSessionRepository,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import {
  IssueCollaborationSessionUseCase,
  IssueSeedCollaborationSessionUseCase,
} from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";

const SEED_COLLABORATION_SESSION_REPOSITORY = Symbol("SEED_COLLABORATION_SESSION_REPOSITORY");

@Module({
  imports: [DocumentsModule, IdentityModule],
  controllers: [CollaborationSessionController, DocumentCollaborationSessionController],
  providers: [
    {
      provide: COLLABORATION_SESSION_REPOSITORY,
      useClass: PrismaCollaborationSessionRepository,
    },
    {
      provide: SEED_COLLABORATION_SESSION_REPOSITORY,
      useClass: SeedCollaborationSessionRepository,
    },
    {
      provide: IssueCollaborationSessionUseCase,
      useFactory: (repository: CollaborationSessionRepository) =>
        new IssueCollaborationSessionUseCase(repository),
      inject: [COLLABORATION_SESSION_REPOSITORY],
    },
    {
      provide: IssueSeedCollaborationSessionUseCase,
      useFactory: (repository: CollaborationSessionRepository) =>
        new IssueSeedCollaborationSessionUseCase(repository),
      inject: [SEED_COLLABORATION_SESSION_REPOSITORY],
    },
  ],
})
export class CollaborationModule {}
