import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceId } from "@rme/contracts";

export const DOCUMENT_IMAGE_ARTIFACT_STORAGE = Symbol("DOCUMENT_IMAGE_ARTIFACT_STORAGE");

export type StoreDocumentImageArtifactInput = Readonly<{
  documentId: DocumentId;
  filename: string;
  contentType: string;
  checksumSha256: string;
  sizeBytes: number;
  payload: Uint8Array;
}>;

export type StoredDocumentImageArtifact = Readonly<{
  id: string;
  documentId: DocumentId;
  workspaceId: WorkspaceId;
  storageKey: string;
  contentType: string;
  checksumSha256: string;
  sizeBytes: number;
}>;

export interface DocumentImageArtifactStorage {
  storeDocumentImage(input: StoreDocumentImageArtifactInput): Promise<StoredDocumentImageArtifact>;
}

export class DocumentImageArtifactOwnerNotFoundError extends Error {
  constructor(readonly documentId: DocumentId) {
    super("Document not found.");
  }
}
