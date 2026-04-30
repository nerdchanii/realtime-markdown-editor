import { strict as assert } from "node:assert";
import { test } from "node:test";

import { NotFoundException } from "@nestjs/common";

import { InternalCollaborationRuntimeController } from "@/modules/collaboration/interfaces/internal-collaboration-runtime.controller.js";
import { ProductCollaborationDocumentNotFoundError } from "@/modules/collaboration/ports/live-yjs-document-state-repository.js";

test("internal runtime controller maps missing product document on Yjs store to not found", async () => {
  const controller = new InternalCollaborationRuntimeController(
    { execute: async () => null } as never,
    { execute: async () => null } as never,
    {
      execute: async () => {
        throw new ProductCollaborationDocumentNotFoundError("workspace_review/missing_document");
      },
    } as never,
  );

  await assert.rejects(
    controller.putLiveYjsDocumentState("workspace_review/missing_document", {
      stateBase64: "AQID",
    }),
    NotFoundException,
  );
});
