import {
  CollaborationSessionNotFoundError,
  type CollaborationSessionClient,
} from "./session-client.js";
import { encodeDocumentKey } from "./document-key-codec.js";
import { validateCollaborationSession } from "./session-contract.js";

type FetchLike = (url: URL, init?: RequestInit) => Promise<Response>;

export function createProductCollaborationSessionClient(
  apiBaseUrl: string,
  fetchImpl: FetchLike = fetch,
): CollaborationSessionClient {
  const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, "");

  return {
    loadSession: (documentKey) => loadProductSession(normalizedBaseUrl, fetchImpl, documentKey),
  };
}

async function loadProductSession(apiBaseUrl: string, fetchImpl: FetchLike, documentKey: string) {
  const response = await fetchImpl(sessionUrl(apiBaseUrl, documentKey), { method: "GET" });
  if (response.status === 404 || response.status === 403) {
    throw new CollaborationSessionNotFoundError(documentKey);
  }
  if (!response.ok) {
    throw new Error(`Failed to load collaboration session: ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  const issuedSession = readIssuedSession(payload);
  return validateCollaborationSession({
    documentId: issuedSession.documentId,
    documentKey: issuedSession.documentKey,
    realtimeUrl: issuedSession.realtimeUrl,
    currentMemberId: issuedSession.currentMember.id,
    members: issuedSession.allowedMembers,
    sync: issuedSession.sync,
  });
}

function sessionUrl(apiBaseUrl: string, documentKey: string): URL {
  return new URL(
    `${apiBaseUrl}/collaboration/internal/document-sessions/${encodeDocumentKey(documentKey)}`,
  );
}

function readIssuedSession(payload: unknown): {
  documentId: unknown;
  documentKey: unknown;
  realtimeUrl: unknown;
  currentMember: { id: unknown };
  allowedMembers: unknown;
  sync: unknown;
} {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Collaboration session response must be an object.");
  }

  const record = payload as Record<string, unknown>;
  if (!record.currentMember || typeof record.currentMember !== "object") {
    throw new Error("Collaboration session response requires currentMember.");
  }

  return {
    documentId: record.documentId,
    documentKey: record.documentKey,
    realtimeUrl: record.realtimeUrl,
    currentMember: record.currentMember as { id: unknown },
    allowedMembers: record.allowedMembers,
    sync: record.sync,
  };
}
