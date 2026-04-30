import type { CollabRuntimeConfig } from "../config.js";
import {
  CollaborationSessionNotFoundError,
  type CollaborationSessionClient,
} from "../session/session-client.js";
import { validateCollaborationSession } from "../session/session-contract.js";

export function createSeedCollaborationSessionClient(
  config: CollabRuntimeConfig,
): CollaborationSessionClient {
  const sessionPayload = createSeedSessionPayload(config);

  return {
    async loadSession(documentKey) {
      const session = validateCollaborationSession(sessionPayload);
      if (session.documentKey === documentKey) return session;
      if (documentKey.startsWith("workspace_review/")) {
        return createReviewRouteSession(config, documentKey);
      }
      throw new CollaborationSessionNotFoundError(documentKey);
    },
  };
}

function createSeedSessionPayload(config: CollabRuntimeConfig): unknown {
  return {
    documentId: "document_review_plan",
    documentKey: config.seedDocumentKey,
    realtimeUrl: realtimeUrlForDocument(config, config.seedDocumentKey),
    currentMemberId: "member_alice",
    members: seedMembers,
    sync: {
      status: "connecting",
      pendingLocalEdits: 0,
      lastSyncedAt: null,
    },
  };
}

function realtimeUrlForDocument(config: CollabRuntimeConfig, documentKey: string): string {
  return `${config.publicRealtimeUrl}/collaboration/${encodeURIComponent(documentKey)}`;
}

function createReviewRouteSession(config: CollabRuntimeConfig, documentKey: string) {
  return validateCollaborationSession({
    documentId: documentKey.slice("workspace_review/".length),
    documentKey,
    realtimeUrl: realtimeUrlForDocument(config, documentKey),
    currentMemberId: "member_alice",
    members: seedMembers,
    sync: {
      status: "connecting",
      pendingLocalEdits: 0,
      lastSyncedAt: null,
    },
  });
}

const seedMembers = [
  {
    id: "member_alice",
    userId: "user_alice",
    workspaceId: "workspace_review",
    displayName: "Alice",
    color: "#2563eb",
  },
  {
    id: "member_bob",
    userId: "user_bob",
    workspaceId: "workspace_review",
    displayName: "Bob",
    color: "#059669",
  },
  {
    id: "member_carol",
    userId: "user_carol",
    workspaceId: "workspace_review",
    displayName: "Carol",
    color: "#8250df",
  },
  {
    id: "member_dana",
    userId: "user_dana",
    workspaceId: "workspace_review",
    displayName: "Dana",
    color: "#bf3989",
  },
] as const;
