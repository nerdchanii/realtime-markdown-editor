import type { Document, DocumentId } from "@/modules/documents/domain/document.js";

export const DOCUMENT_REPOSITORY = Symbol("DOCUMENT_REPOSITORY");

export interface DocumentRepository {
  findById(id: DocumentId): Promise<Document | null>;
  save(document: Document): Promise<void>;
}
