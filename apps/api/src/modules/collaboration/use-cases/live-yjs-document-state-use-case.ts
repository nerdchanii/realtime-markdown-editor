import type {
  CollaborationDocumentKey,
  LiveYjsDocumentStateRepository,
} from "@/modules/collaboration/ports/live-yjs-document-state-repository.js";

export class LoadLiveYjsDocumentStateUseCase {
  constructor(private readonly states: LiveYjsDocumentStateRepository) {}

  async execute(input: { documentKey: CollaborationDocumentKey }): Promise<Uint8Array | null> {
    return this.states.loadDocumentState(input.documentKey);
  }
}

export class StoreLiveYjsDocumentStateUseCase {
  constructor(private readonly states: LiveYjsDocumentStateRepository) {}

  async execute(input: {
    documentKey: CollaborationDocumentKey;
    state: Uint8Array;
  }): Promise<void> {
    await this.states.storeDocumentState(input);
  }
}
