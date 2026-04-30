import type { DocumentId, WorkspaceMembershipId } from "@rme/contracts";

import type { ApiClient } from "@/lib/api-client";

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
  apiClient?: ApiClient;
  memberLabels?: Readonly<Record<string, string>>;
  checkpoints?: readonly HistoryCheckpoint[];
}>;
