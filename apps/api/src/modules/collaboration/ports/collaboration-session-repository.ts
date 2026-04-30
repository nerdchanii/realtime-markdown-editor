export type CollaborationDocumentId = string & { readonly __brand: "DocumentId" };
export type CollaborationUserId = string & { readonly __brand: "UserId" };
export type CollaborationWorkspaceId = string & { readonly __brand: "WorkspaceId" };
export type CollaborationMembershipId = string & { readonly __brand: "WorkspaceMembershipId" };

export type CollaborationMember = Readonly<{
  id: CollaborationMembershipId;
  userId: CollaborationUserId;
  workspaceId: CollaborationWorkspaceId;
  displayName: string;
  color: string;
}>;

export type CollaborationSyncStatus =
  | "connecting"
  | "synced"
  | "offline"
  | "reconnecting"
  | "pending-local-changes"
  | "error";

export type CollaborationSyncState = Readonly<{
  status: CollaborationSyncStatus;
  pendingLocalEdits: number;
  lastSyncedAt: Date | null;
}>;

export type CollaborationSession = Readonly<{
  documentId: CollaborationDocumentId;
  documentKey: string;
  realtimeUrl: string;
  currentMember: CollaborationMember;
  allowedMembers: readonly CollaborationMember[];
  sync: CollaborationSyncState;
}>;

export type CollaborationSessionLookup = Readonly<{
  documentId: CollaborationDocumentId;
  currentMembershipId: CollaborationMembershipId;
}>;

export type RuntimeCollaborationSessionLookup = Readonly<{
  documentKey: string;
}>;

export const COLLABORATION_SESSION_REPOSITORY = Symbol("COLLABORATION_SESSION_REPOSITORY");

export interface CollaborationSessionRepository {
  findSession(lookup: CollaborationSessionLookup): Promise<CollaborationSession | null>;
  findRuntimeSession(
    lookup: RuntimeCollaborationSessionLookup,
  ): Promise<CollaborationSession | null>;
  findSeedSession(memberId: CollaborationMembershipId | null): Promise<CollaborationSession | null>;
}
