import { Module } from "@nestjs/common";

import { LocalCheckpointRepository } from "@/modules/documents/adapters/local-checkpoint-repository.js";
import { CheckpointsController } from "@/modules/documents/interfaces/checkpoints.controller.js";
import { MarkdownExportController } from "@/modules/documents/interfaces/markdown-export.controller.js";
import {
  CHECKPOINT_REPOSITORY,
  type CheckpointRepository,
} from "@/modules/documents/ports/checkpoint-repository.js";
import { InMemoryDocumentRepository } from "@/modules/documents/adapters/in-memory-document-repository.js";
import { CreateDocumentUseCase } from "@/modules/documents/use-cases/create-document-use-case.js";
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from "@/modules/documents/ports/document-repository.js";
import { CreateCheckpointUseCase } from "@/modules/documents/use-cases/create-checkpoint-use-case.js";
import { InspectCheckpointSnapshotUseCase } from "@/modules/documents/use-cases/inspect-checkpoint-snapshot-use-case.js";
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
      useClass: InMemoryDocumentRepository,
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
    ExportMarkdownUseCase,
  ],
  exports: [
    CreateDocumentUseCase,
    CreateCheckpointUseCase,
    InspectCheckpointSnapshotUseCase,
    ExportMarkdownUseCase,
  ],
})
export class DocumentsModule {}
