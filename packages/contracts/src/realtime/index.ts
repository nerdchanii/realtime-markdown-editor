import type { DocumentId, UserId, WorkspaceId, WorkspaceMembershipId } from "../ids.js";

export type RealtimeMemberDto = Readonly<{
  id: WorkspaceMembershipId;
  userId: UserId;
  workspaceId: WorkspaceId;
  displayName: string;
  color: string;
}>;

export type DocumentSyncStatusDto =
  | "connecting"
  | "synced"
  | "offline"
  | "reconnecting"
  | "pending-local-changes"
  | "error";

export type DocumentSyncStateDto = Readonly<{
  status: DocumentSyncStatusDto;
  pendingLocalEdits: number;
  lastSyncedAt: string | null;
}>;

export type RemoteCursorDto = Readonly<{
  documentId: DocumentId;
  membershipId: WorkspaceMembershipId;
  anchor: number;
  head: number;
}>;

export type RemoteSelectionDto = Readonly<{
  documentId: DocumentId;
  membershipId: WorkspaceMembershipId;
  anchor: number;
  head: number;
  isCollapsed: boolean;
}>;

export type AwarenessStateDto = Readonly<{
  documentId: DocumentId;
  member: RealtimeMemberDto;
  cursor: RemoteCursorDto | null;
  selection: RemoteSelectionDto | null;
  updatedAt: string;
}>;

export type CollaborationSessionDto = Readonly<{
  documentId: DocumentId;
  documentKey: string;
  realtimeUrl: string;
  currentMemberId: WorkspaceMembershipId;
  members: readonly RealtimeMemberDto[];
  sync: DocumentSyncStateDto;
}>;
