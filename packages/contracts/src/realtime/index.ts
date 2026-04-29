import type { DocumentId, WorkspaceMembershipId } from "../ids.js";

export type RemoteCursorDto = Readonly<{
  documentId: DocumentId;
  membershipId: WorkspaceMembershipId;
  anchor: number;
  head: number;
}>;

export type DocumentSyncStatusDto = "connecting" | "synced" | "offline" | "reconnecting";
