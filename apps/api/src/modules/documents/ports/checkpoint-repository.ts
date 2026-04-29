import type { Checkpoint, CheckpointId } from "@/modules/documents/domain/checkpoint.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";

export const CHECKPOINT_REPOSITORY = Symbol("CHECKPOINT_REPOSITORY");

export type CreateCheckpointInput = Readonly<{
  documentId: DocumentId;
  authorMembershipId: WorkspaceMembershipId;
  message: string;
  markdownSnapshot: string;
}>;

export type CheckpointSnapshot = Readonly<{
  checkpoint: Checkpoint;
  markdownBody: string;
}>;

export interface CheckpointRepository {
  createCheckpoint(input: CreateCheckpointInput): Promise<CheckpointSnapshot>;
  findCheckpointSnapshot(checkpointId: CheckpointId): Promise<CheckpointSnapshot | null>;
  listCheckpoints(documentId: DocumentId): Promise<readonly Checkpoint[]>;
}
