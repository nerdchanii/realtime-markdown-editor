import type { Document, DocumentId } from "@/modules/documents/domain/document.js";
import type { DocumentRepository } from "@/modules/documents/ports/document-repository.js";

export class InMemoryDocumentRepository implements DocumentRepository {
  private readonly documents = new Map<DocumentId, Document>();

  async findById(id: DocumentId): Promise<Document | null> {
    return this.documents.get(id) ?? null;
  }

  async save(document: Document): Promise<void> {
    this.documents.set(document.id, document);
  }
}
