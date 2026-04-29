import type { FolderId } from "@/modules/workspace/domain/folder.js";
import type { DocumentProperty } from "@/modules/documents/domain/document-property.js";
import type { DocumentState } from "@/modules/documents/domain/document-state.js";

export type DocumentId = string & { readonly __brand: "DocumentId" };

export type Document = Readonly<{
  id: DocumentId;
  folderId: FolderId;
  title: string;
  markdownBodyRef: string;
  state: DocumentState;
  properties: readonly DocumentProperty[];
}>;

export function createDocument(input: {
  id: DocumentId;
  folderId: FolderId;
  title: string;
  markdownBodyRef: string;
  properties?: readonly DocumentProperty[];
}): Document {
  return {
    id: input.id,
    folderId: input.folderId,
    title: input.title,
    markdownBodyRef: input.markdownBodyRef,
    state: "draft",
    properties: input.properties ?? [],
  };
}
