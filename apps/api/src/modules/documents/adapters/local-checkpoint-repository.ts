import { createHash, randomUUID } from "node:crypto";

import type { Checkpoint, CheckpointId } from "@/modules/documents/domain/checkpoint.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type {
  CreateCheckpointInput,
  CheckpointRepository,
  CheckpointSnapshot,
} from "@/modules/documents/ports/checkpoint-repository.js";

type ArtifactRecord = Readonly<{
  key: string;
  markdownBody: string;
}>;

export class LocalCheckpointRepository implements CheckpointRepository {
  private readonly checkpoints = new Map<CheckpointId, Checkpoint>();
  private readonly artifacts = new Map<string, ArtifactRecord>();

  async createCheckpoint(input: CreateCheckpointInput): Promise<CheckpointSnapshot> {
    const checkpointId = `checkpoint_${randomUUID()}` as CheckpointId;
    const artifact = this.storeMarkdownSnapshot(checkpointId, input.markdownSnapshot);
    const checkpoint: Checkpoint = {
      id: checkpointId,
      documentId: input.documentId,
      authorMembershipId: input.authorMembershipId,
      message: input.message,
      createdAt: new Date(),
      snapshotArtifactRef: artifact.key,
    };

    this.checkpoints.set(checkpoint.id, checkpoint);
    return { checkpoint, markdownBody: artifact.markdownBody };
  }

  async findCheckpointSnapshot(checkpointId: CheckpointId): Promise<CheckpointSnapshot | null> {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) return null;

    const artifact = this.artifacts.get(checkpoint.snapshotArtifactRef);
    if (!artifact) return null;

    return { checkpoint, markdownBody: artifact.markdownBody };
  }

  async listCheckpoints(documentId: DocumentId): Promise<readonly Checkpoint[]> {
    return [...this.checkpoints.values()]
      .filter((checkpoint) => checkpoint.documentId === documentId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  private storeMarkdownSnapshot(checkpointId: CheckpointId, markdownBody: string): ArtifactRecord {
    const checksum = createHash("sha256").update(markdownBody).digest("hex");
    const artifact = {
      key: `local/checkpoints/${checkpointId}/${checksum}.md`,
      markdownBody,
    };

    this.artifacts.set(artifact.key, artifact);
    return artifact;
  }
}
