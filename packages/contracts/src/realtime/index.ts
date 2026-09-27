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

export type IssuedCollaborationSessionDto = Readonly<{
  documentId: DocumentId;
  documentKey: string;
  realtimeUrl: string;
  currentMember: RealtimeMemberDto;
  allowedMembers: readonly RealtimeMemberDto[];
  sync: DocumentSyncStateDto;
  connection: CollaborationConnectionGrantDto;
}>;

export type CollaborationAccessDto = "read" | "write";

/**
 * 협업 서버 연결에 쓰는 짧은 TTL 의 서명된 token 이다(ADR-0012 §1).
 * token 은 문서, principal, 허용 action 에 묶인다. `read` 연결은 협업 서버가 read-only 로 연다.
 */
export type CollaborationConnectionGrantDto = Readonly<{
  token: string;
  expiresAt: string;
  access: CollaborationAccessDto;
}>;
