import { Module } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import { PrismaCollaborationSessionRepository } from "@/modules/collaboration/adapters/prisma-collaboration-session-repository.js";
import { PrismaLiveYjsDocumentStateRepository } from "@/modules/collaboration/adapters/prisma-live-yjs-document-state-repository.js";
import { SeedCollaborationSessionRepository } from "@/modules/collaboration/adapters/seed-collaboration-session-repository.js";
import { CollaborationSessionController } from "@/modules/collaboration/interfaces/collaboration-session.controller.js";
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
  IssueSeedCollaborationSessionUseCase,
  LoadRuntimeCollaborationSessionUseCase,
} from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";
import {
  LoadLiveYjsDocumentStateUseCase,
  StoreLiveYjsDocumentStateUseCase,
} from "@/modules/collaboration/use-cases/live-yjs-document-state-use-case.js";

const SEED_COLLABORATION_SESSION_REPOSITORY = Symbol("SEED_COLLABORATION_SESSION_REPOSITORY");
const BOOLEAN_VALUES = new Map([
  ["1", true],
  ["true", true],
  ["yes", true],
  ["0", false],
  ["false", false],
  ["no", false],
]);

@Module({
  imports: [DocumentsModule, IdentityModule],
  controllers: [
    CollaborationSessionController,
    DocumentCollaborationSessionController,
    InternalCollaborationRuntimeController,
  ],
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
    {
      provide: LoadRuntimeCollaborationSessionUseCase,
      useFactory: (
        repository: CollaborationSessionRepository,
        seedRepository: CollaborationSessionRepository,
      ) =>
        new LoadRuntimeCollaborationSessionUseCase(
          createRuntimeSessionRepository(
            repository,
            seedRepository,
            readBoolean(process.env.RME_API_ENABLE_SEED_RUNTIME_SESSION_FALLBACK, false),
          ),
        ),
      inject: [COLLABORATION_SESSION_REPOSITORY, SEED_COLLABORATION_SESSION_REPOSITORY],
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

export function createRuntimeSessionRepository(
  primary: CollaborationSessionRepository,
  fallback: CollaborationSessionRepository,
  enableSeedFallback: boolean,
): CollaborationSessionRepository {
  if (!enableSeedFallback) return primary;

  return {
    findSession: (lookup) => primary.findSession(lookup),
    findSeedSession: (memberId) => fallback.findSeedSession(memberId),
    async findRuntimeSession(lookup) {
      try {
        return (await primary.findRuntimeSession(lookup)) ?? fallback.findRuntimeSession(lookup);
      } catch (error) {
        const fallbackSession = await fallback.findRuntimeSession(lookup);
        if (fallbackSession) return fallbackSession;
        throw error;
      }
    },
  };
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return fallback;
  return BOOLEAN_VALUES.get(normalized) ?? fallback;
}
