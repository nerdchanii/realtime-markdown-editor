import type { DocumentId } from "@/modules/documents/domain/document.js";

export const CHECKPOINT_SNAPSHOT_ARTIFACT_STORAGE = Symbol("CHECKPOINT_SNAPSHOT_ARTIFACT_STORAGE");

export type StoreCheckpointSnapshotArtifactInput = Readonly<{
  documentId: DocumentId;
  checkpointId: string;
  markdownBody: string;
}>;

export type StoredCheckpointSnapshotArtifact = Readonly<{
  documentId: DocumentId;
  storageKey: string;
  contentType: "text/markdown; charset=utf-8";
  checksumSha256: string;
  sizeBytes: number;
  metadata: {
    workspaceId: string;
    documentId: string;
    checkpointId: string;
    storageKey: string;
  };
}>;

export interface CheckpointSnapshotArtifactStorage {
  writeCheckpointSnapshot(
    input: StoreCheckpointSnapshotArtifactInput,
  ): Promise<StoredCheckpointSnapshotArtifact>;
  readCheckpointSnapshot(storageKey: string): Promise<string | null>;
  deleteCheckpointSnapshot(storageKey: string): Promise<void>;
}

export class CheckpointSnapshotArtifactOwnerNotFoundError extends Error {
  constructor(documentId: DocumentId) {
    super(`Document ${documentId} was not found for checkpoint snapshot artifact storage.`);
    this.name = "CheckpointSnapshotArtifactOwnerNotFoundError";
  }
}
