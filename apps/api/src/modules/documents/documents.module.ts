import { Module } from "@nestjs/common";

import { PrismaDatabaseService } from "@/database/database.service.js";
import { IdentityModule } from "@/modules/identity/identity.module.js";
import {
  LocalDocumentImageArtifactStorage,
  type ImageArtifactPersistenceClient,
} from "@/modules/artifacts/adapters/local-document-image-artifact-storage.js";
import {
  LocalCheckpointSnapshotArtifactStorage,
  type CheckpointArtifactPersistenceClient,
} from "@/modules/artifacts/adapters/local-checkpoint-snapshot-artifact-storage.js";
import {
  CHECKPOINT_SNAPSHOT_ARTIFACT_STORAGE,
  type CheckpointSnapshotArtifactStorage,
} from "@/modules/artifacts/ports/checkpoint-snapshot-artifact-storage.js";
import {
  DOCUMENT_IMAGE_ARTIFACT_STORAGE,
  type DocumentImageArtifactStorage,
} from "@/modules/artifacts/ports/document-image-artifact-storage.js";
import {
  PrismaDocumentContentRepository,
  type PrismaDocumentContentPersistenceClient,
} from "@/modules/documents/adapters/prisma-document-content-repository.js";
import {
  PrismaDocumentProductRepository,
  type PrismaDocumentProductPersistenceClient,
} from "@/modules/documents/adapters/prisma-document-product-repository.js";
import {
  PrismaDocumentRepository,
  type PrismaDocumentPersistenceClient,
} from "@/modules/documents/adapters/prisma-document-repository.js";
import {
  PrismaCheckpointRepository,
  type PrismaCheckpointPersistenceClient,
} from "@/modules/documents/adapters/prisma-checkpoint-repository.js";
import { CheckpointsController } from "@/modules/documents/interfaces/checkpoints.controller.js";
import { DocumentsProductController } from "@/modules/documents/interfaces/documents-product.controller.js";
import { ImageUploadController } from "@/modules/documents/interfaces/image-upload.controller.js";
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
  DOCUMENT_PRODUCT_REPOSITORY,
  type DocumentProductRepository,
} from "@/modules/documents/ports/document-product-repository.js";
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from "@/modules/documents/ports/document-repository.js";
import { CreateCheckpointUseCase } from "@/modules/documents/use-cases/create-checkpoint-use-case.js";
import { DocumentProductService } from "@/modules/documents/use-cases/document-product-service.js";
import { InspectCheckpointSnapshotUseCase } from "@/modules/documents/use-cases/inspect-checkpoint-snapshot-use-case.js";
import { ListCheckpointsUseCase } from "@/modules/documents/use-cases/list-checkpoints-use-case.js";
import { ExportMarkdownUseCase } from "@/modules/documents/use-cases/export-markdown-use-case.js";
import { UploadDocumentImageUseCase } from "@/modules/documents/use-cases/upload-document-image-use-case.js";

@Module({
  imports: [IdentityModule],
  controllers: [
    DocumentsProductController,
    CheckpointsController,
    ImageUploadController,
    MarkdownExportController,
  ],
  providers: [
    {
      provide: CHECKPOINT_REPOSITORY,
      useFactory: (database: PrismaDatabaseService, artifacts: CheckpointSnapshotArtifactStorage) =>
        new PrismaCheckpointRepository(
          database as unknown as PrismaCheckpointPersistenceClient,
          artifacts,
        ),
      inject: [PrismaDatabaseService, CHECKPOINT_SNAPSHOT_ARTIFACT_STORAGE],
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
      provide: DOCUMENT_PRODUCT_REPOSITORY,
      useFactory: (database: PrismaDatabaseService) =>
        new PrismaDocumentProductRepository(
          database as unknown as PrismaDocumentProductPersistenceClient,
        ),
      inject: [PrismaDatabaseService],
    },
    {
      provide: DOCUMENT_IMAGE_ARTIFACT_STORAGE,
      useFactory: (database: PrismaDatabaseService) =>
        new LocalDocumentImageArtifactStorage(
          database as unknown as ImageArtifactPersistenceClient,
        ),
      inject: [PrismaDatabaseService],
    },
    {
      provide: CHECKPOINT_SNAPSHOT_ARTIFACT_STORAGE,
      useFactory: (database: PrismaDatabaseService) =>
        new LocalCheckpointSnapshotArtifactStorage(
          database as unknown as CheckpointArtifactPersistenceClient,
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
      useFactory: (repository: CheckpointRepository, content: DocumentContentRepository) =>
        new CreateCheckpointUseCase(repository, content),
      inject: [CHECKPOINT_REPOSITORY, DOCUMENT_CONTENT_REPOSITORY],
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
    {
      provide: DocumentProductService,
      useFactory: (repository: DocumentProductRepository, content: DocumentContentRepository) =>
        new DocumentProductService(repository, content),
      inject: [DOCUMENT_PRODUCT_REPOSITORY, DOCUMENT_CONTENT_REPOSITORY],
    },
    {
      provide: UploadDocumentImageUseCase,
      useFactory: (artifacts: DocumentImageArtifactStorage) =>
        new UploadDocumentImageUseCase(artifacts),
      inject: [DOCUMENT_IMAGE_ARTIFACT_STORAGE],
    },
  ],
  exports: [
    DocumentProductService,
    CreateDocumentUseCase,
    CreateCheckpointUseCase,
    InspectCheckpointSnapshotUseCase,
    ListCheckpointsUseCase,
    ExportMarkdownUseCase,
    DOCUMENT_PRODUCT_REPOSITORY,
    UploadDocumentImageUseCase,
    DOCUMENT_CONTENT_REPOSITORY,
  ],
})
export class DocumentsModule {}
