import type { RevisionId } from "@rme/contracts";

import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { DocumentContentProjection } from "@/modules/documents/ports/document-content-repository.js";

const localCurrentMarkdownProjections = new Map<string, DocumentContentProjection>();

export function isLocalReviewDocumentId(documentId: string): boolean {
  return documentId.startsWith("document_local_");
}

export function findLocalCurrentMarkdownProjection(
  documentId: string,
): DocumentContentProjection | null {
  return localCurrentMarkdownProjections.get(documentId) ?? null;
}

export function saveLocalCurrentMarkdownProjection(input: {
  documentId: string;
  markdownBody: string;
  latestRevisionId?: RevisionId | null | undefined;
}): DocumentContentProjection {
  const projection = {
    documentId: input.documentId as DocumentId,
    markdownBody: input.markdownBody,
    latestRevisionId: input.latestRevisionId ?? null,
    updatedAt: new Date(),
  } satisfies DocumentContentProjection;
  localCurrentMarkdownProjections.set(input.documentId, projection);
  return projection;
}
