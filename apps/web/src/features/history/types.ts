import type { DocumentId, WorkspaceMembershipId } from "@rme/contracts";

export type HistoryCheckpoint = Readonly<{
  id: string;
  documentId?: DocumentId;
  message: string;
  author: string;
  authorMembershipId?: WorkspaceMembershipId;
  createdAt: string;
  snapshot: string;
}>;

export type HistoryInspectorViewModel = Readonly<{
  replacementPoint: string;
  label: string;
  documentId?: DocumentId;
  currentMemberId?: WorkspaceMembershipId;
  checkpoints?: readonly HistoryCheckpoint[];
}>;
