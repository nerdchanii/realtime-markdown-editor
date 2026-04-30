import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { Checkpoint, CheckpointId } from "@/modules/documents/domain/checkpoint.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type {
  CreateCheckpointInput,
  CheckpointRepository,
  CheckpointSnapshot,
} from "@/modules/documents/ports/checkpoint-repository.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import type { RevisionId } from "@rme/contracts";

type ArtifactRecord = Readonly<{
  key: string;
  markdownBody: string;
}>;

type StoredCheckpointRecord = Readonly<{
  id: string;
  documentId: string;
  revisionId: string;
  authorMembershipId: string;
  message: string;
  createdAt: string;
  snapshotArtifactRef: string;
}>;

export class LocalCheckpointRepository implements CheckpointRepository {
  constructor(
    private readonly dataDir = process.env.RME_CHECKPOINT_DATA_DIR ??
      join(process.cwd(), ".data", "checkpoints"),
  ) {}

  async createCheckpoint(input: CreateCheckpointInput): Promise<CheckpointSnapshot> {
    const checkpointId = `checkpoint_${randomUUID()}` as CheckpointId;
    const revisionId = `revision_checkpoint_${randomUUID()}` as RevisionId;
    const artifact = this.createMarkdownArtifact(checkpointId, input.markdownSnapshot);
    const checkpoint: Checkpoint = {
      id: checkpointId,
      documentId: input.documentId,
      revisionId,
      authorMembershipId: input.authorMembershipId,
      message: input.message,
      createdAt: new Date(),
      snapshotArtifactRef: artifact.key,
    };

    await this.storeMarkdownArtifact(artifact);
    await this.storeCheckpoint(checkpoint);
    return { checkpoint, markdownBody: artifact.markdownBody };
  }

  async findCheckpointSnapshot(checkpointId: CheckpointId): Promise<CheckpointSnapshot | null> {
    const checkpoint = await this.readCheckpoint(checkpointId);
    if (!checkpoint) return null;

    const markdownBody = await this.readMarkdownArtifact(checkpoint.snapshotArtifactRef);
    if (markdownBody === null) return null;

    return { checkpoint, markdownBody };
  }

  async listCheckpoints(documentId: DocumentId): Promise<readonly Checkpoint[]> {
    const checkpoints = await this.readCheckpoints();

    return checkpoints
      .filter((checkpoint) => checkpoint.documentId === documentId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  private createMarkdownArtifact(checkpointId: CheckpointId, markdownBody: string): ArtifactRecord {
    const checksum = createHash("sha256").update(markdownBody).digest("hex");
    return {
      key: `local/checkpoints/${checkpointId}/${checksum}.md`,
      markdownBody,
    };
  }

  private async storeCheckpoint(checkpoint: Checkpoint): Promise<void> {
    await mkdir(this.metadataDir(), { recursive: true });
    await writeFile(
      this.checkpointPath(checkpoint.id),
      JSON.stringify(toStoredCheckpointRecord(checkpoint), null, 2),
      "utf8",
    );
  }

  private async storeMarkdownArtifact(artifact: ArtifactRecord): Promise<void> {
    const artifactPath = this.artifactPath(artifact.key);
    await mkdir(dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, artifact.markdownBody, "utf8");
  }

  private async readCheckpoint(checkpointId: CheckpointId): Promise<Checkpoint | null> {
    return this.readCheckpointFile(this.checkpointPath(checkpointId));
  }

  private async readCheckpoints(): Promise<readonly Checkpoint[]> {
    let entries: readonly string[];
    try {
      entries = await readdir(this.metadataDir());
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return [];
      throw error;
    }

    const checkpoints = await Promise.all(
      entries
        .filter((entry) => entry.endsWith(".json"))
        .map((entry) => this.readCheckpointFile(join(this.metadataDir(), entry))),
    );

    return checkpoints.filter((checkpoint): checkpoint is Checkpoint => checkpoint !== null);
  }

  private async readCheckpointFile(filePath: string): Promise<Checkpoint | null> {
    let rawRecord: string;
    try {
      rawRecord = await readFile(filePath, "utf8");
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return null;
      throw error;
    }

    const parsed = JSON.parse(rawRecord) as unknown;
    if (!isStoredCheckpointRecord(parsed)) return null;

    return toCheckpoint(parsed);
  }

  private async readMarkdownArtifact(artifactRef: string): Promise<string | null> {
    try {
      return await readFile(this.artifactPath(artifactRef), "utf8");
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return null;
      throw error;
    }
  }

  private metadataDir(): string {
    return join(this.dataDir, "metadata");
  }

  private checkpointPath(checkpointId: CheckpointId): string {
    return join(this.metadataDir(), `${checkpointId}.json`);
  }

  private artifactPath(artifactRef: string): string {
    return join(this.dataDir, "artifacts", ...artifactRef.split("/"));
  }
}

function toStoredCheckpointRecord(checkpoint: Checkpoint): StoredCheckpointRecord {
  return {
    id: checkpoint.id,
    documentId: checkpoint.documentId,
    revisionId: checkpoint.revisionId,
    authorMembershipId: checkpoint.authorMembershipId,
    message: checkpoint.message,
    createdAt: checkpoint.createdAt.toISOString(),
    snapshotArtifactRef: checkpoint.snapshotArtifactRef,
  };
}

function toCheckpoint(record: StoredCheckpointRecord): Checkpoint | null {
  const createdAt = new Date(record.createdAt);
  if (Number.isNaN(createdAt.getTime())) return null;

  return {
    id: record.id as CheckpointId,
    documentId: record.documentId as DocumentId,
    revisionId: record.revisionId as RevisionId,
    authorMembershipId: record.authorMembershipId as WorkspaceMembershipId,
    message: record.message,
    createdAt,
    snapshotArtifactRef: record.snapshotArtifactRef,
  };
}

function isStoredCheckpointRecord(value: unknown): value is StoredCheckpointRecord {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Partial<Record<keyof StoredCheckpointRecord, unknown>>;
  const fields = [
    record.id,
    record.documentId,
    record.revisionId,
    record.authorMembershipId,
    record.message,
    record.createdAt,
    record.snapshotArtifactRef,
  ];

  return fields.every((field) => typeof field === "string");
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
