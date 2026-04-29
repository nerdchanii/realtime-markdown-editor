export type RealtimeMember = Readonly<{
  id: string;
  userId: string;
  workspaceId: string;
  displayName: string;
  color: string;
}>;

export type DocumentSyncStatus =
  | "connecting"
  | "synced"
  | "offline"
  | "reconnecting"
  | "pending-local-changes"
  | "error";

export type DocumentSyncState = Readonly<{
  status: DocumentSyncStatus;
  pendingLocalEdits: number;
  lastSyncedAt: string | null;
}>;

export type CollaborationSession = Readonly<{
  documentId: string;
  documentKey: string;
  realtimeUrl: string;
  currentMemberId: string;
  members: readonly RealtimeMember[];
  sync: DocumentSyncState;
}>;

const syncStatuses = new Set<DocumentSyncStatus>([
  "connecting",
  "synced",
  "offline",
  "reconnecting",
  "pending-local-changes",
  "error",
]);

export class InvalidCollaborationSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCollaborationSessionError";
  }
}

export function validateCollaborationSession(payload: unknown): CollaborationSession {
  const session = readRecord(payload, "session");
  const members = readArray(session.members, "session.members").map((member, index) =>
    validateRealtimeMember(member, `session.members[${index}]`),
  );
  const currentMemberId = readString(session.currentMemberId, "session.currentMemberId");

  if (!members.some((member) => member.id === currentMemberId)) {
    throw new InvalidCollaborationSessionError("session.currentMemberId must exist in members");
  }

  return {
    documentId: readString(session.documentId, "session.documentId"),
    documentKey: readString(session.documentKey, "session.documentKey"),
    realtimeUrl: readWebsocketUrl(session.realtimeUrl, "session.realtimeUrl"),
    currentMemberId,
    members,
    sync: validateSyncState(session.sync),
  };
}

function validateRealtimeMember(payload: unknown, label: string): RealtimeMember {
  const member = readRecord(payload, label);

  return {
    id: readString(member.id, `${label}.id`),
    userId: readString(member.userId, `${label}.userId`),
    workspaceId: readString(member.workspaceId, `${label}.workspaceId`),
    displayName: readString(member.displayName, `${label}.displayName`),
    color: readString(member.color, `${label}.color`),
  };
}

function validateSyncState(payload: unknown): DocumentSyncState {
  const sync = readRecord(payload, "session.sync");
  const status = readString(sync.status, "session.sync.status");

  if (!syncStatuses.has(status as DocumentSyncStatus)) {
    throw new InvalidCollaborationSessionError(`session.sync.status is not supported: ${status}`);
  }

  return {
    status: status as DocumentSyncStatus,
    pendingLocalEdits: readNonNegativeInteger(
      sync.pendingLocalEdits,
      "session.sync.pendingLocalEdits",
    ),
    lastSyncedAt: readNullableString(sync.lastSyncedAt, "session.sync.lastSyncedAt"),
  };
}

function readRecord(payload: unknown, label: string): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new InvalidCollaborationSessionError(`${label} must be an object`);
  }

  return payload as Record<string, unknown>;
}

function readArray(payload: unknown, label: string): readonly unknown[] {
  if (!Array.isArray(payload)) {
    throw new InvalidCollaborationSessionError(`${label} must be an array`);
  }

  return payload;
}

function readString(payload: unknown, label: string): string {
  if (typeof payload !== "string" || payload.trim().length === 0) {
    throw new InvalidCollaborationSessionError(`${label} must be a non-empty string`);
  }

  return payload;
}

function readNullableString(payload: unknown, label: string): string | null {
  if (payload === null) return null;
  return readString(payload, label);
}

function readWebsocketUrl(payload: unknown, label: string): string {
  const value = readString(payload, label);

  try {
    const url = new URL(value);
    if (url.protocol === "ws:" || url.protocol === "wss:") return value;
  } catch {
    throw new InvalidCollaborationSessionError(`${label} must be a websocket URL`);
  }

  throw new InvalidCollaborationSessionError(`${label} must be a websocket URL`);
}

function readNonNegativeInteger(payload: unknown, label: string): number {
  if (typeof payload !== "number" || !Number.isInteger(payload) || payload < 0) {
    throw new InvalidCollaborationSessionError(`${label} must be a non-negative integer`);
  }

  return payload;
}
