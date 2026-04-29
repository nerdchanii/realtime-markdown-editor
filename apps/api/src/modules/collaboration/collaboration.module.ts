import { Module } from "@nestjs/common";

import { SeedCollaborationSessionRepository } from "@/modules/collaboration/adapters/seed-collaboration-session-repository.js";
import { CollaborationSessionController } from "@/modules/collaboration/interfaces/collaboration-session.controller.js";
import {
  COLLABORATION_SESSION_REPOSITORY,
  type CollaborationSessionRepository,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import {
  IssueCollaborationSessionUseCase,
  IssueSeedCollaborationSessionUseCase,
} from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";

@Module({
  controllers: [CollaborationSessionController],
  providers: [
    {
      provide: COLLABORATION_SESSION_REPOSITORY,
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
      inject: [COLLABORATION_SESSION_REPOSITORY],
    },
  ],
})
export class CollaborationModule {}
