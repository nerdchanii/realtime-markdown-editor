import { Module } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import {
  PrismaDocumentContentRepository,
  type PrismaDocumentContentPersistenceClient,
} from "@/modules/documents/adapters/prisma-document-content-repository.js";
import {
  PrismaDocumentRepository,
  type PrismaDocumentPersistenceClient,
} from "@/modules/documents/adapters/prisma-document-repository.js";
import { LocalCheckpointRepository } from "@/modules/documents/adapters/local-checkpoint-repository.js";
import { CheckpointsController } from "@/modules/documents/interfaces/checkpoints.controller.js";
import { MarkdownExportController } from "@/modules/documents/interfaces/markdown-export.controller.js";
import {
  CHECKPOINT_REPOSITORY,
  type CheckpointRepository,
} from "@/modules/documents/ports/checkpoint-repository.js";
import { CreateDocumentUseCase } from "@/modules/documents/use-cases/create-document-use-case.js";
import {
  DOCUMENT_CONTENT_REPOSITORY,
  type DocumentContentRepository,
} from "@/modules/documents/ports/document-content-repository.js";
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from "@/modules/documents/ports/document-repository.js";
import { CreateCheckpointUseCase } from "@/modules/documents/use-cases/create-checkpoint-use-case.js";
import { InspectCheckpointSnapshotUseCase } from "@/modules/documents/use-cases/inspect-checkpoint-snapshot-use-case.js";
import { ListCheckpointsUseCase } from "@/modules/documents/use-cases/list-checkpoints-use-case.js";
import { ExportMarkdownUseCase } from "@/modules/documents/use-cases/export-markdown-use-case.js";

@Module({
  controllers: [CheckpointsController, MarkdownExportController],
  providers: [
    {
      provide: CHECKPOINT_REPOSITORY,
      useClass: LocalCheckpointRepository,
    },
    {
      provide: DOCUMENT_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) =>
        new PrismaDocumentRepository(database as unknown as PrismaDocumentPersistenceClient),
      inject: [PrismaDatabaseService],
    },
    {
      provide: DOCUMENT_CONTENT_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) =>
        new PrismaDocumentContentRepository(
          database as unknown as PrismaDocumentContentPersistenceClient,
        ),
      inject: [PrismaDatabaseService],
    },
    {
      provide: CreateDocumentUseCase,
      useFactory: (repository: DocumentRepository) => new CreateDocumentUseCase(repository),
      inject: [DOCUMENT_REPOSITORY],
    },
    {
      provide: CreateCheckpointUseCase,
      useFactory: (repository: CheckpointRepository) => new CreateCheckpointUseCase(repository),
      inject: [CHECKPOINT_REPOSITORY],
    },
    {
      provide: InspectCheckpointSnapshotUseCase,
      useFactory: (repository: CheckpointRepository) =>
        new InspectCheckpointSnapshotUseCase(repository),
      inject: [CHECKPOINT_REPOSITORY],
    },
    {
      provide: ListCheckpointsUseCase,
      useFactory: (repository: CheckpointRepository) => new ListCheckpointsUseCase(repository),
      inject: [CHECKPOINT_REPOSITORY],
    },
    {
      provide: ExportMarkdownUseCase,
      useFactory: (documents: DocumentRepository, content: DocumentContentRepository) =>
        new ExportMarkdownUseCase(documents, content),
      inject: [DOCUMENT_REPOSITORY, DOCUMENT_CONTENT_REPOSITORY],
    },
  ],
  exports: [
    CreateDocumentUseCase,
    CreateCheckpointUseCase,
    InspectCheckpointSnapshotUseCase,
    ListCheckpointsUseCase,
    ExportMarkdownUseCase,
    DOCUMENT_CONTENT_REPOSITORY,
  ],
})
export class DocumentsModule {}
