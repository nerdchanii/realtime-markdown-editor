import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import type { RevisionId } from "@rme/contracts";

export type CheckpointId = string & { readonly __brand: "CheckpointId" };

export type Checkpoint = Readonly<{
  id: CheckpointId;
  documentId: DocumentId;
  revisionId: RevisionId;
  authorMembershipId: WorkspaceMembershipId;
  message: string;
  createdAt: Date;
  snapshotArtifactRef: string;
}>;
