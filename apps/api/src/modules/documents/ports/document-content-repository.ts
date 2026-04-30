import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { RevisionId } from "@rme/contracts";

export const DOCUMENT_CONTENT_REPOSITORY = Symbol("DOCUMENT_CONTENT_REPOSITORY");

export type DocumentContentSource = "collaboration-projection" | "manual-import";

export type DocumentContentProjection = Readonly<{
  documentId: DocumentId;
  markdownBody: string;
  latestRevisionId: RevisionId | null;
  updatedAt: Date;
}>;

export type SaveDocumentContentInput = Readonly<{
  documentId: DocumentId;
  markdownBody: string;
  latestRevisionId?: RevisionId | null;
  source: DocumentContentSource;
}>;

export interface DocumentContentRepository {
  findCurrentContent(documentId: DocumentId): Promise<DocumentContentProjection | null>;
  saveCurrentContent(input: SaveDocumentContentInput): Promise<DocumentContentProjection>;
}
