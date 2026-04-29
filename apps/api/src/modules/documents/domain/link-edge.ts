import type { DocumentId } from "@/modules/documents/domain/document.js";

export type LinkEdge = Readonly<{
  sourceDocumentId: DocumentId;
  targetDocumentId: DocumentId;
  markdownHref: string;
}>;
