import { Module } from "@nestjs/common";

import { InMemoryDocumentRepository } from "@/modules/documents/adapters/in-memory-document-repository.js";
import { CreateDocumentUseCase } from "@/modules/documents/use-cases/create-document-use-case.js";
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from "@/modules/documents/ports/document-repository.js";

@Module({
  providers: [
    {
      provide: DOCUMENT_REPOSITORY,
      useClass: InMemoryDocumentRepository,
    },
    {
      provide: CreateDocumentUseCase,
      useFactory: (repository: DocumentRepository) => new CreateDocumentUseCase(repository),
      inject: [DOCUMENT_REPOSITORY],
    },
  ],
  exports: [CreateDocumentUseCase],
})
export class DocumentsModule {}
