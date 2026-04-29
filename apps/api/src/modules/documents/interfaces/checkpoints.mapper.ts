import { createHash } from "node:crypto";

import type { Checkpoint } from "@/modules/documents/domain/checkpoint.js";
import type { CheckpointSnapshot } from "@/modules/documents/ports/checkpoint-repository.js";
import type {
  ArtifactReferenceDto,
  CheckpointDto,
  CheckpointSnapshotInspectDto,
  RevisionId,
} from "@rme/contracts";

export function mapCheckpointToDto(checkpoint: Checkpoint, markdownBody: string): CheckpointDto {
  return {
    id: checkpoint.id,
    documentId: checkpoint.documentId,
    revisionId: revisionIdForCheckpoint(checkpoint.id),
    authorMembershipId: checkpoint.authorMembershipId,
    message: checkpoint.message,
    createdAt: checkpoint.createdAt.toISOString(),
    snapshotArtifact: mapArtifact(checkpoint.snapshotArtifactRef, markdownBody),
  };
}

export function mapCheckpointSnapshotToDto(
  snapshot: CheckpointSnapshot,
): CheckpointSnapshotInspectDto {
  return {
    checkpointId: snapshot.checkpoint.id,
    documentId: snapshot.checkpoint.documentId,
    revisionId: revisionIdForCheckpoint(snapshot.checkpoint.id),
    markdownBody: snapshot.markdownBody,
    artifact: mapArtifact(snapshot.checkpoint.snapshotArtifactRef, snapshot.markdownBody),
  };
}

function mapArtifact(key: string, markdownBody: string): ArtifactReferenceDto {
  return {
    key,
    contentType: "text/markdown; charset=utf-8",
    checksumSha256: createHash("sha256").update(markdownBody).digest("hex"),
    sizeBytes: Buffer.byteLength(markdownBody, "utf8"),
  };
}

function revisionIdForCheckpoint(checkpointId: string): RevisionId {
  return checkpointId.replace(/^checkpoint_/, "revision_checkpoint_") as RevisionId;
}
