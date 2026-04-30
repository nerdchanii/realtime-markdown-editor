import { strict as assert } from "node:assert";
import { test } from "node:test";

import { PrismaLiveYjsDocumentStateRepository } from "@/modules/collaboration/adapters/prisma-live-yjs-document-state-repository.js";
import type { CollaborationDocumentKey } from "@/modules/collaboration/ports/live-yjs-document-state-repository.js";

test("Prisma live Yjs repository rejects store when the product document does not exist", async () => {
  const repository = new PrismaLiveYjsDocumentStateRepository({
    liveCollaborationState: {
      findUnique: async () => null,
    },
    document: {
      findUnique: async () => null,
    },
  } as never);

  await assert.rejects(
    repository.storeDocumentState({
      documentKey: "workspace_review/missing_document" as CollaborationDocumentKey,
      state: new Uint8Array([1, 2, 3]),
    }),
    /Product document not found for collaboration key: workspace_review\/missing_document/,
  );
});
