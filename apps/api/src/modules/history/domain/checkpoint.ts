import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/identity/domain/workspace-membership.js";

export type CheckpointId = string & { readonly __brand: "CheckpointId" };

export type Checkpoint = Readonly<{
  id: CheckpointId;
  documentId: DocumentId;
  authorMembershipId: WorkspaceMembershipId;
  message: string;
  createdAt: Date;
  snapshotArtifactRef: string;
}>;
