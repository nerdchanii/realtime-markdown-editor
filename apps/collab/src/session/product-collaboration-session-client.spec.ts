import { strict as assert } from "node:assert";
import { test } from "node:test";

import { createProductCollaborationSessionClient } from "./product-collaboration-session-client.js";

test("product collaboration session client loads provider-neutral session data by document key", async () => {
  const requestedUrls: string[] = [];
  const client = createProductCollaborationSessionClient("http://127.0.0.1:4000", async (url) => {
    requestedUrls.push(url.toString());
    return new Response(
      JSON.stringify({
        documentId: "document_review_plan",
        documentKey: "workspace_review/document_review_plan",
        realtimeUrl: "ws://127.0.0.1:1234/collaboration/workspace_review%2Fdocument_review_plan",
        currentMember: {
          id: "member_alice",
          userId: "user_alice",
          workspaceId: "workspace_review",
          displayName: "Alice",
          color: "#2563eb",
        },
        allowedMembers: [
          {
            id: "member_alice",
            userId: "user_alice",
            workspaceId: "workspace_review",
            displayName: "Alice",
            color: "#2563eb",
          },
        ],
        sync: {
          status: "synced",
          pendingLocalEdits: 0,
          lastSyncedAt: null,
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });

  const session = await client.loadSession("workspace_review/document_review_plan");

  assert.equal(
    requestedUrls[0],
    "http://127.0.0.1:4000/collaboration/internal/document-sessions/d29ya3NwYWNlX3Jldmlldy9kb2N1bWVudF9yZXZpZXdfcGxhbg",
  );
  assert.equal(session.documentId, "document_review_plan");
  assert.equal(session.currentMemberId, "member_alice");
  assert.equal(session.members.length, 1);
});

test("product collaboration session client fails visibly when product API session load fails", async () => {
  const client = createProductCollaborationSessionClient(
    "http://127.0.0.1:4000",
    async () => new Response(null, { status: 500 }),
  );

  await assert.rejects(
    client.loadSession("workspace_review/document_review_plan"),
    /Failed to load collaboration session: 500/,
  );
});
