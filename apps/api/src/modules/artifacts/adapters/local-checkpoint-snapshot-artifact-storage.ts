import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type {
  CheckpointSnapshotArtifactStorage,
  StoredCheckpointSnapshotArtifact,
  StoreCheckpointSnapshotArtifactInput,
} from "@/modules/artifacts/ports/checkpoint-snapshot-artifact-storage.js";
import { CheckpointSnapshotArtifactOwnerNotFoundError } from "@/modules/artifacts/ports/checkpoint-snapshot-artifact-storage.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceId } from "@rme/contracts";

type CheckpointArtifactDocumentRecord = Readonly<{
  id: string;
  folder: Readonly<{
    workspaceId: string;
  }>;
}>;

type CheckpointArtifactMetadata = Readonly<{
  workspaceId: string;
  documentId: string;
  checkpointId: string;
  storageKey: string;
}>;

export type CheckpointArtifactPersistenceClient = Readonly<{
  document: {
    findUnique(args: {
      where: { id: string };
      select: { id: true; folder: { select: { workspaceId: true } } };
    }): Promise<CheckpointArtifactDocumentRecord | null>;
  };
}>;

export class LocalCheckpointSnapshotArtifactStorage implements CheckpointSnapshotArtifactStorage {
  constructor(
    private readonly client: CheckpointArtifactPersistenceClient,
    private readonly dataDir = process.env.RME_CHECKPOINT_ARTIFACT_DATA_DIR ??
      join(process.cwd(), ".data", "checkpoint-artifacts"),
  ) {}

  async writeCheckpointSnapshot(
    input: StoreCheckpointSnapshotArtifactInput,
  ): Promise<StoredCheckpointSnapshotArtifact> {
    const workspaceId = await this.findDocumentWorkspaceId(input.documentId);
    const checksumSha256 = createHash("sha256").update(input.markdownBody).digest("hex");
    const sizeBytes = Buffer.byteLength(input.markdownBody, "utf8");
    const storageKey = storageKeyForCheckpoint({
      workspaceId,
      documentId: input.documentId,
      checkpointId: input.checkpointId,
      checksumSha256,
    });

    await this.writeArtifactPayload(storageKey, input.markdownBody);

    return {
      documentId: input.documentId,
      storageKey,
      contentType: "text/markdown; charset=utf-8",
      checksumSha256,
      sizeBytes,
      metadata: checkpointArtifactMetadata(input, workspaceId, storageKey),
    };
  }

  async readCheckpointSnapshot(storageKey: string): Promise<string | null> {
    try {
      return await readFile(this.artifactPath(storageKey), "utf8");
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") return null;
      throw error;
    }
  }

  async deleteCheckpointSnapshot(storageKey: string): Promise<void> {
    await rm(this.artifactPath(storageKey), { force: true });
  }

  private async findDocumentWorkspaceId(documentId: DocumentId): Promise<WorkspaceId> {
    const document = await this.client.document.findUnique({
      where: { id: documentId },
      select: { id: true, folder: { select: { workspaceId: true } } },
    });
    if (!document) throw new CheckpointSnapshotArtifactOwnerNotFoundError(documentId);

    return document.folder.workspaceId as WorkspaceId;
  }

  private async writeArtifactPayload(storageKey: string, markdownBody: string): Promise<void> {
    const artifactPath = this.artifactPath(storageKey);
    await mkdir(dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, markdownBody, "utf8");
  }

  private artifactPath(storageKey: string): string {
    return join(this.dataDir, ...storageKey.split("/"));
  }
}

function storageKeyForCheckpoint(input: {
  workspaceId: WorkspaceId;
  documentId: DocumentId;
  checkpointId: string;
  checksumSha256: string;
}): string {
  return [
    "local",
    "workspaces",
    input.workspaceId,
    "documents",
    input.documentId,
    "checkpoints",
    `${input.checkpointId}-${input.checksumSha256}-${randomUUID()}.md`,
  ].join("/");
}

function checkpointArtifactMetadata(
  input: StoreCheckpointSnapshotArtifactInput,
  workspaceId: WorkspaceId,
  storageKey: string,
): CheckpointArtifactMetadata {
  return {
    workspaceId,
    documentId: input.documentId,
    checkpointId: input.checkpointId,
    storageKey,
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
