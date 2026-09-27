import { Module } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import {
  HmacCollaborationTokenSigner,
  readCollaborationTokenConfig,
  type CollaborationTokenConfig,
} from "@/modules/collaboration/adapters/hmac-collaboration-token-signer.js";
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
  COLLABORATION_TOKEN_POLICY,
  COLLABORATION_TOKEN_SIGNER,
  type CollaborationTokenPolicy,
  type CollaborationTokenSigner,
} from "@/modules/collaboration/ports/collaboration-token-signer.js";
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

const COLLABORATION_TOKEN_CONFIG = Symbol("COLLABORATION_TOKEN_CONFIG");

@Module({
  imports: [DocumentsModule, IdentityModule],
  controllers: [DocumentCollaborationSessionController, InternalCollaborationRuntimeController],
  providers: [
    {
      // secret 이 없으면 API 가 시작하지 않는다. 협업 연결 인증을 끈 채로 뜨는 경로는 두지 않는다.
      provide: COLLABORATION_TOKEN_CONFIG,
      useFactory: () => readCollaborationTokenConfig(process.env),
    },
    {
      provide: COLLABORATION_TOKEN_SIGNER,
      useFactory: (config: CollaborationTokenConfig) =>
        new HmacCollaborationTokenSigner(config.secret),
      inject: [COLLABORATION_TOKEN_CONFIG],
    },
    {
      provide: COLLABORATION_TOKEN_POLICY,
      useFactory: (config: CollaborationTokenConfig): CollaborationTokenPolicy => ({
        ttlSeconds: config.ttlSeconds,
      }),
      inject: [COLLABORATION_TOKEN_CONFIG],
    },
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
      useFactory: (
        repository: CollaborationSessionRepository,
        signer: CollaborationTokenSigner,
        policy: CollaborationTokenPolicy,
      ) => new IssueCollaborationSessionUseCase(repository, signer, policy),
      inject: [
        COLLABORATION_SESSION_REPOSITORY,
        COLLABORATION_TOKEN_SIGNER,
        COLLABORATION_TOKEN_POLICY,
      ],
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
