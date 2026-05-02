import assert from "node:assert/strict";
import test from "node:test";

import type {
  CollaborationSessionDto,
  DocumentId,
  UserId,
  WorkspaceId,
  WorkspaceMembershipId,
} from "@rme/contracts";

import { isSameCollaborationRuntimeSession } from "./tiptap-yjs-session";

test("isSameCollaborationRuntimeSession treats refetched equivalent sessions as stable", () => {
  const current = collaborationSession();
  const refetched = collaborationSession();

  assert.notEqual(current, refetched);
  assert.equal(isSameCollaborationRuntimeSession(current, refetched), true);
});

test("isSameCollaborationRuntimeSession changes when the realtime document changes", () => {
  const current = collaborationSession();
  const next = collaborationSession({
    documentId: documentId("document_next"),
    documentKey: "workspace_main/document_next",
  });

  assert.equal(isSameCollaborationRuntimeSession(current, next), false);
});

function collaborationSession(
  overrides: Partial<CollaborationSessionDto> = {},
): CollaborationSessionDto {
  return {
    documentId: documentId("document_main"),
    documentKey: "workspace_main/document_main",
    realtimeUrl: "ws://127.0.0.1:4001/collaboration",
    currentMemberId: membershipId("member_alice"),
    members: [
      {
        id: membershipId("member_alice"),
        userId: userId("user_alice"),
        workspaceId: workspaceId("workspace_main"),
        displayName: "Alice",
        color: "#0969da",
      },
      {
        id: membershipId("member_bob"),
        userId: userId("user_bob"),
        workspaceId: workspaceId("workspace_main"),
        displayName: "Bob",
        color: "#1a7f37",
      },
    ],
    sync: {
      status: "synced",
      pendingLocalEdits: 0,
      lastSyncedAt: null,
    },
    ...overrides,
  };
}

function documentId(value: string): DocumentId {
  return value as DocumentId;
}

function membershipId(value: string): WorkspaceMembershipId {
  return value as WorkspaceMembershipId;
}

function userId(value: string): UserId {
  return value as UserId;
}

function workspaceId(value: string): WorkspaceId {
  return value as WorkspaceId;
}
