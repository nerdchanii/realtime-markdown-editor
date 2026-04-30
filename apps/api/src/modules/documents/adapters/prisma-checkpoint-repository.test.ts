import { strict as assert } from "node:assert";
import { test } from "node:test";

import type {
  CheckpointSnapshotArtifactStorage,
  StoreCheckpointSnapshotArtifactInput,
} from "@/modules/artifacts/ports/checkpoint-snapshot-artifact-storage.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";

import { PrismaCheckpointRepository } from "./prisma-checkpoint-repository.js";

test("PrismaCheckpointRepository stores checkpoint metadata in Postgres and payload through artifacts", async () => {
  const client = new FakeCheckpointPersistenceClient();
  const artifacts = new FakeCheckpointSnapshotArtifactStorage();
  const repository = new PrismaCheckpointRepository(client, artifacts);

  const created = await repository.createCheckpoint({
    documentId: "document_a" as DocumentId,
    authorMembershipId: "member_alice" as WorkspaceMembershipId,
    message: "Persist checkpoint",
    markdownSnapshot: "# Artifact-backed snapshot",
  });

  assertCheckpointCreated(client, artifacts, created);

  const listed = await repository.listCheckpoints("document_a" as DocumentId);
  const inspected = await repository.findCheckpointSnapshot(created.checkpoint.id);

  assert.equal(listed.length, 1);
  assert.equal(listed[0]?.id, created.checkpoint.id);
  assert.equal(inspected?.markdownBody, "# Artifact-backed snapshot");
});

function assertCheckpointCreated(
  client: FakeCheckpointPersistenceClient,
  artifacts: FakeCheckpointSnapshotArtifactStorage,
  created: Awaited<ReturnType<PrismaCheckpointRepository["createCheckpoint"]>>,
) {
  const createdArtifact = client.createdArtifact;
  const createdRevision = client.createdRevision;
  const createdCheckpoint = client.createdCheckpoint;
  assert.ok(createdArtifact);
  assert.ok(createdRevision);
  assert.ok(createdCheckpoint);

  assert.equal(artifacts.stored?.markdownBody, "# Artifact-backed snapshot");
  assert.equal(createdArtifact.kind, "checkpointSnapshot");
  assert.equal(createdArtifact.key, artifacts.writtenArtifact?.storageKey);
  assert.equal(createdRevision.snapshotArtifactId, "artifact_checkpoint_a");
  assert.equal(createdRevision.source, "checkpoint");
  assert.equal(createdCheckpoint.snapshotArtifactId, "artifact_checkpoint_a");
  assert.equal(createdCheckpoint.revisionId, createdRevision.id);
  assert.equal(created.checkpoint.revisionId, createdRevision.id);
  assert.equal(created.markdownBody, "# Artifact-backed snapshot");
}

test("PrismaCheckpointRepository cleans up payload when metadata transaction fails", async () => {
  const client = new FakeCheckpointPersistenceClient({ failCheckpointCreate: true });
  const artifacts = new FakeCheckpointSnapshotArtifactStorage();
  const repository = new PrismaCheckpointRepository(client, artifacts);

  await assert.rejects(
    repository.createCheckpoint({
      documentId: "document_a" as DocumentId,
      authorMembershipId: "member_alice" as WorkspaceMembershipId,
      message: "Persist checkpoint",
      markdownSnapshot: "# Artifact-backed snapshot",
    }),
    /checkpoint create failed/,
  );

  assert.equal(client.createdArtifact, null);
  assert.equal(client.createdRevision, null);
  assert.equal(client.createdCheckpoint, null);
  assert.equal(artifacts.deletedStorageKey, artifacts.writtenArtifact?.storageKey);
});

class FakeCheckpointSnapshotArtifactStorage implements CheckpointSnapshotArtifactStorage {
  stored: StoreCheckpointSnapshotArtifactInput | null = null;
  writtenArtifact: Awaited<
    ReturnType<CheckpointSnapshotArtifactStorage["writeCheckpointSnapshot"]>
  > | null = null;
  deletedStorageKey: string | null = null;

  async writeCheckpointSnapshot(input: StoreCheckpointSnapshotArtifactInput) {
    this.stored = input;
    const storageKey = checkpointStorageKey(input);
    this.writtenArtifact = {
      documentId: input.documentId,
      storageKey,
      contentType: "text/markdown; charset=utf-8" as const,
      checksumSha256: "a".repeat(64),
      sizeBytes: Buffer.byteLength(input.markdownBody, "utf8"),
      metadata: {
        workspaceId: "workspace_a",
        documentId: input.documentId,
        checkpointId: input.checkpointId,
        storageKey,
      },
    };
    return this.writtenArtifact;
  }

  async readCheckpointSnapshot() {
    return this.stored?.markdownBody ?? null;
  }

  async deleteCheckpointSnapshot(storageKey: string) {
    this.deletedStorageKey = storageKey;
  }
}

type RevisionCreateData = Readonly<{
  id: string;
  documentId: string;
  authorMembershipId: string;
  source: "checkpoint";
  message: string;
  snapshotArtifactId: string;
}>;

type CheckpointCreateData = Readonly<{
  id: string;
  documentId: string;
  revisionId: string;
  authorMembershipId: string;
  message: string;
  snapshotArtifactId: string;
}>;

type ArtifactCreateData = Readonly<{
  documentId: string;
  key: string;
  kind: "checkpointSnapshot";
  contentType: "text/markdown; charset=utf-8";
  checksumSha256: string;
  sizeBytes: bigint;
  metadata: {
    workspaceId: string;
    documentId: string;
    checkpointId: string;
    storageKey: string;
  };
}>;

class FakeCheckpointPersistenceClient {
  constructor(private readonly options: { failCheckpointCreate?: boolean } = {}) {}

  createdArtifact: (ArtifactCreateData & { id: string }) | null = null;
  createdRevision: RevisionCreateData | null = null;
  createdCheckpoint:
    | (CheckpointCreateData & {
        createdAt: Date;
        snapshotArtifact: { id: string; key: string };
      })
    | null = null;

  readonly artifact = {
    create: async ({ data }: { data: ArtifactCreateData }) => {
      this.createdArtifact = { ...data, id: "artifact_checkpoint_a" };
      return { id: this.createdArtifact.id, key: data.key };
    },
  };

  readonly revision = {
    create: async ({ data }: { data: RevisionCreateData }) => {
      this.createdRevision = data;
      return data;
    },
  };

  readonly checkpoint = {
    create: async ({
      data,
      include,
    }: {
      data: CheckpointCreateData;
      include: { snapshotArtifact: true };
    }) => {
      assert.deepEqual(include, { snapshotArtifact: true });
      if (this.options.failCheckpointCreate) throw new Error("checkpoint create failed");
      this.createdCheckpoint = {
        ...data,
        createdAt: new Date("2026-04-30T12:00:00.000Z"),
        snapshotArtifact: {
          id: this.createdArtifact?.id ?? "artifact_checkpoint_a",
          key: this.createdArtifact?.key ?? "checkpoint-a.md",
        },
      };
      return this.createdCheckpoint;
    },
    findMany: async () => (this.createdCheckpoint ? [this.createdCheckpoint] : []),
    findUnique: async () => this.createdCheckpoint,
  };

  async $transaction<T>(callback: (client: this) => Promise<T>): Promise<T> {
    const previousArtifact = this.createdArtifact;
    const previousRevision = this.createdRevision;
    const previousCheckpoint = this.createdCheckpoint;

    try {
      return await callback(this);
    } catch (error) {
      this.createdArtifact = previousArtifact;
      this.createdRevision = previousRevision;
      this.createdCheckpoint = previousCheckpoint;
      throw error;
    }
  }
}

function checkpointStorageKey(input: StoreCheckpointSnapshotArtifactInput): string {
  return `local/workspaces/workspace_a/documents/${input.documentId}/checkpoints/${input.checkpointId}.md`;
}
