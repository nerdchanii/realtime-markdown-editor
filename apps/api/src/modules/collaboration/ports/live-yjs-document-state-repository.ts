export type CollaborationDocumentKey = string & { readonly __brand: "CollaborationDocumentKey" };

export interface LiveYjsDocumentStateRepository {
  loadDocumentState(documentKey: CollaborationDocumentKey): Promise<Uint8Array | null>;
  storeDocumentState(input: {
    documentKey: CollaborationDocumentKey;
    state: Uint8Array;
  }): Promise<void>;
}

export const LIVE_YJS_DOCUMENT_STATE_REPOSITORY = Symbol("LIVE_YJS_DOCUMENT_STATE_REPOSITORY");

export class ProductCollaborationDocumentNotFoundError extends Error {
  constructor(documentKey: string) {
    super(`Product document not found for collaboration key: ${documentKey}`);
    this.name = "ProductCollaborationDocumentNotFoundError";
  }
}
