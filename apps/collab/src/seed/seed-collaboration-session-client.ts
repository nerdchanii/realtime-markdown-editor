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
      if (session.documentKey !== documentKey)
        throw new CollaborationSessionNotFoundError(documentKey);
      return session;
    },
  };
}

function createSeedSessionPayload(config: CollabRuntimeConfig): unknown {
  return {
    documentId: "document_seed",
    documentKey: config.seedDocumentKey,
    realtimeUrl: realtimeUrlForDocument(config, config.seedDocumentKey),
    currentMemberId: "membership_alice",
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

const seedMembers = [
  {
    id: "membership_alice",
    userId: "user_alice",
    workspaceId: "workspace_seed",
    displayName: "Alice Kim",
    color: "#2563eb",
  },
  {
    id: "membership_bob",
    userId: "user_bob",
    workspaceId: "workspace_seed",
    displayName: "Bob Lee",
    color: "#059669",
  },
] as const;
