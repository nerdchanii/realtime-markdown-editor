import { createDocument, type Document } from "@/modules/documents/domain/document.js";
import type { DocumentRepository } from "@/modules/documents/ports/document-repository.js";

export class CreateDocumentUseCase {
  constructor(private readonly documents: DocumentRepository) {}

  async execute(input: Parameters<typeof createDocument>[0]): Promise<Document> {
    const document = createDocument(input);
    await this.documents.save(document);
    return document;
  }
}
