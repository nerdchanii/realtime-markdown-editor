import { Module } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import { PrismaCollaborationSessionRepository } from "@/modules/collaboration/adapters/prisma-collaboration-session-repository.js";
import { PrismaLiveYjsDocumentStateRepository } from "@/modules/collaboration/adapters/prisma-live-yjs-document-state-repository.js";
import { DocumentCollaborationSessionController } from "@/modules/collaboration/interfaces/document-collaboration-session.controller.js";
import { InternalCollaborationRuntimeController } from "@/modules/collaboration/interfaces/internal-collaboration-runtime.controller.js";
import { DocumentsModule } from "@/modules/documents/documents.module.js";
import { IdentityModule } from "@/modules/identity/identity.module.js";
import {
  COLLABORATION_SESSION_REPOSITORY,
  type CollaborationSessionRepository,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import {
  LIVE_YJS_DOCUMENT_STATE_REPOSITORY,
  type LiveYjsDocumentStateRepository,
} from "@/modules/collaboration/ports/live-yjs-document-state-repository.js";
import {
  IssueCollaborationSessionUseCase,
  LoadRuntimeCollaborationSessionUseCase,
} from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";
import {
  LoadLiveYjsDocumentStateUseCase,
  StoreLiveYjsDocumentStateUseCase,
} from "@/modules/collaboration/use-cases/live-yjs-document-state-use-case.js";

@Module({
  imports: [DocumentsModule, IdentityModule],
  controllers: [DocumentCollaborationSessionController, InternalCollaborationRuntimeController],
  providers: [
    {
      provide: COLLABORATION_SESSION_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) =>
        new PrismaCollaborationSessionRepository(database),
      inject: [PrismaDatabaseService],
    },
    {
      provide: LIVE_YJS_DOCUMENT_STATE_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) =>
        new PrismaLiveYjsDocumentStateRepository(database),
      inject: [PrismaDatabaseService],
    },
    {
      provide: IssueCollaborationSessionUseCase,
      useFactory: (repository: CollaborationSessionRepository) =>
        new IssueCollaborationSessionUseCase(repository),
      inject: [COLLABORATION_SESSION_REPOSITORY],
    },
    {
      provide: LoadRuntimeCollaborationSessionUseCase,
      useFactory: (repository: CollaborationSessionRepository) =>
        new LoadRuntimeCollaborationSessionUseCase(repository),
      inject: [COLLABORATION_SESSION_REPOSITORY],
    },
    {
      provide: LoadLiveYjsDocumentStateUseCase,
      useFactory: (repository: LiveYjsDocumentStateRepository) =>
        new LoadLiveYjsDocumentStateUseCase(repository),
      inject: [LIVE_YJS_DOCUMENT_STATE_REPOSITORY],
    },
    {
      provide: StoreLiveYjsDocumentStateUseCase,
      useFactory: (repository: LiveYjsDocumentStateRepository) =>
        new StoreLiveYjsDocumentStateUseCase(repository),
      inject: [LIVE_YJS_DOCUMENT_STATE_REPOSITORY],
    },
  ],
})
export class CollaborationModule {}
