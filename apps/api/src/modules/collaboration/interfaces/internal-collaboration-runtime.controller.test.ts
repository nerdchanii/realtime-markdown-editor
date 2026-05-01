import { strict as assert } from "node:assert";
import { test } from "node:test";

import { BadRequestException, NotFoundException } from "@nestjs/common";

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
    {
      findCurrentContent: async () => null,
      saveCurrentContent: async () => {
        throw new Error("not used");
      },
    },
  );

  await assert.rejects(
    controller.putLiveYjsDocumentState("workspace_review/missing_document", {
      stateBase64: "AQID",
    }),
    NotFoundException,
  );
});

test("internal runtime controller stores document content projection without user session", async () => {
  const controller = new InternalCollaborationRuntimeController(
    { execute: async () => null } as never,
    { execute: async () => null } as never,
    { execute: async () => undefined } as never,
    {
      findCurrentContent: async () => null,
      saveCurrentContent: async (input) => ({
        documentId: input.documentId,
        markdownBody: input.markdownBody,
        latestRevisionId: input.latestRevisionId ?? null,
        updatedAt: new Date("2026-05-01T00:00:00.000Z"),
      }),
    },
  );

  const response = await controller.putDocumentContentProjection("document_1", {
    markdownBody: "# Saved through Yjs\n",
  });

  assert.deepEqual(response, {
    content: {
      documentId: "document_1",
      markdownBody: "# Saved through Yjs\n",
      latestRevisionId: null,
      updatedAt: "2026-05-01T00:00:00.000Z",
    },
  });
});

test("internal runtime controller rejects invalid document content projection payload", async () => {
  const controller = new InternalCollaborationRuntimeController(
    { execute: async () => null } as never,
    { execute: async () => null } as never,
    { execute: async () => undefined } as never,
    {
      findCurrentContent: async () => null,
      saveCurrentContent: async () => {
        throw new Error("not used");
      },
    },
  );

  await assert.rejects(
    controller.putDocumentContentProjection("document_1", { markdownBody: 123 }),
    BadRequestException,
  );
});
