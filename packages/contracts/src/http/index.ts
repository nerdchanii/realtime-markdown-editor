import type { CheckpointId, DocumentId, WorkspaceMembershipId } from "../ids.js";

export type DocumentStateDto = "draft" | "review" | "saved";

export type DocumentSummaryDto = Readonly<{
  id: DocumentId;
  title: string;
  state: DocumentStateDto;
}>;

export type CheckpointDto = Readonly<{
  id: CheckpointId;
  documentId: DocumentId;
  authorMembershipId: WorkspaceMembershipId;
  message: string;
  createdAt: string;
}>;
