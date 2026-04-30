import { strict as assert } from "node:assert";
import { test } from "node:test";

import type {
  CollaborationDocumentKey,
  LiveYjsDocumentStateRepository,
} from "@/modules/collaboration/ports/live-yjs-document-state-repository.js";
import {
  LoadLiveYjsDocumentStateUseCase,
  StoreLiveYjsDocumentStateUseCase,
} from "@/modules/collaboration/use-cases/live-yjs-document-state-use-case.js";

test("live Yjs document state use cases load and store provider state by document key", async () => {
  const repository = new RecordingLiveYjsDocumentStateRepository();
  const documentKey = "workspace_review/document_review_plan" as CollaborationDocumentKey;
  const state = new Uint8Array([1, 2, 3, 255]);

  await new StoreLiveYjsDocumentStateUseCase(repository).execute({ documentKey, state });
  const loaded = await new LoadLiveYjsDocumentStateUseCase(repository).execute({ documentKey });

  assert.equal(repository.stored?.documentKey, documentKey);
  assert.deepEqual(repository.stored?.state, state);
  assert.deepEqual(loaded, state);
});

class RecordingLiveYjsDocumentStateRepository implements LiveYjsDocumentStateRepository {
  stored: Readonly<{ documentKey: CollaborationDocumentKey; state: Uint8Array }> | null = null;

  async loadDocumentState(documentKey: CollaborationDocumentKey): Promise<Uint8Array | null> {
    assert.equal(documentKey, this.stored?.documentKey);
    return this.stored?.state ?? null;
  }

  async storeDocumentState(input: {
    documentKey: CollaborationDocumentKey;
    state: Uint8Array;
  }): Promise<void> {
    this.stored = input;
  }
}
