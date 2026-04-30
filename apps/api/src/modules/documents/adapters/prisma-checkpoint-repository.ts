import { randomUUID } from "node:crypto";

import type { Checkpoint, CheckpointId } from "@/modules/documents/domain/checkpoint.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import type {
  CreateCheckpointInput,
  CheckpointRepository,
  CheckpointSnapshot,
} from "@/modules/documents/ports/checkpoint-repository.js";
import type {
  CheckpointSnapshotArtifactStorage,
  StoredCheckpointSnapshotArtifact,
} from "@/modules/artifacts/ports/checkpoint-snapshot-artifact-storage.js";
import type { RevisionId } from "@rme/contracts";

type CheckpointArtifactRecord = Readonly<{
  id: string;
  key: string;
}>;

type CheckpointArtifactCreateData = Readonly<{
  documentId: string;
  key: string;
  kind: "checkpointSnapshot";
  contentType: "text/markdown; charset=utf-8";
  checksumSha256: string;
  sizeBytes: bigint;
  metadata: StoredCheckpointSnapshotArtifact["metadata"];
}>;

type CheckpointRecord = Readonly<{
  id: string;
  documentId: string;
  revisionId: string;
  authorMembershipId: string;
  message: string;
  createdAt: Date;
  snapshotArtifactId: string;
  snapshotArtifact: CheckpointArtifactRecord;
}>;

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

type CheckpointTransactionClient = Readonly<{
  artifact: {
    create(args: { data: CheckpointArtifactCreateData }): Promise<CheckpointArtifactRecord>;
  };
  revision: {
    create(args: { data: RevisionCreateData }): Promise<unknown>;
  };
  checkpoint: {
    create(args: {
      data: CheckpointCreateData;
      include: { snapshotArtifact: true };
    }): Promise<CheckpointRecord>;
  };
}>;

export type PrismaCheckpointPersistenceClient = CheckpointTransactionClient &
  Readonly<{
    checkpoint: CheckpointTransactionClient["checkpoint"] & {
      findUnique(args: {
        where: { id: string };
        include: { snapshotArtifact: true };
      }): Promise<CheckpointRecord | null>;
      findMany(args: {
        where: { documentId: string };
        include: { snapshotArtifact: true };
        orderBy: { createdAt: "desc" };
      }): Promise<CheckpointRecord[]>;
    };
    $transaction<T>(callback: (client: CheckpointTransactionClient) => Promise<T>): Promise<T>;
  }>;

export class PrismaCheckpointRepository implements CheckpointRepository {
  constructor(
    private readonly client: PrismaCheckpointPersistenceClient,
    private readonly artifacts: CheckpointSnapshotArtifactStorage,
  ) {}

  async createCheckpoint(input: CreateCheckpointInput): Promise<CheckpointSnapshot> {
    const checkpointId = newId("checkpoint") as CheckpointId;
    const revisionId = newId("revision_checkpoint");
    const artifact = await this.artifacts.writeCheckpointSnapshot({
      documentId: input.documentId,
      checkpointId,
      markdownBody: input.markdownSnapshot,
    });

    const checkpoint = await this.createCheckpointMetadata(
      input,
      checkpointId,
      revisionId,
      artifact,
    );

    return { checkpoint: toCheckpoint(checkpoint), markdownBody: input.markdownSnapshot };
  }

  private async createCheckpointMetadata(
    input: CreateCheckpointInput,
    checkpointId: CheckpointId,
    revisionId: string,
    artifact: StoredCheckpointSnapshotArtifact,
  ): Promise<CheckpointRecord> {
    try {
      return await this.client.$transaction((transaction) =>
        this.createTransactionRecords(transaction, input, checkpointId, revisionId, artifact),
      );
    } catch (error) {
      await this.artifacts.deleteCheckpointSnapshot(artifact.storageKey);
      throw error;
    }
  }

  private async createTransactionRecords(
    transaction: CheckpointTransactionClient,
    input: CreateCheckpointInput,
    checkpointId: CheckpointId,
    revisionId: string,
    artifact: StoredCheckpointSnapshotArtifact,
  ): Promise<CheckpointRecord> {
    const storedArtifact = await transaction.artifact.create({
      data: toArtifactCreateData(artifact),
    });
    await transaction.revision.create({
      data: toRevisionCreateData(input, revisionId, storedArtifact.id),
    });

    return transaction.checkpoint.create({
      data: toCheckpointCreateData(input, checkpointId, revisionId, storedArtifact.id),
      include: { snapshotArtifact: true },
    });
  }

  async findCheckpointSnapshot(checkpointId: CheckpointId): Promise<CheckpointSnapshot | null> {
    const checkpoint = await this.client.checkpoint.findUnique({
      where: { id: checkpointId },
      include: { snapshotArtifact: true },
    });
    if (!checkpoint) return null;

    return this.toCheckpointSnapshot(checkpoint);
  }

  async listCheckpoints(documentId: DocumentId): Promise<readonly Checkpoint[]> {
    const checkpoints = await this.client.checkpoint.findMany({
      where: { documentId },
      include: { snapshotArtifact: true },
      orderBy: { createdAt: "desc" },
    });

    return checkpoints.map(toCheckpoint);
  }

  private async toCheckpointSnapshot(
    checkpoint: CheckpointRecord,
  ): Promise<CheckpointSnapshot | null> {
    const markdownBody = await this.artifacts.readCheckpointSnapshot(
      checkpoint.snapshotArtifact.key,
    );
    if (markdownBody === null) return null;

    return { checkpoint: toCheckpoint(checkpoint), markdownBody };
  }
}

function toCheckpoint(record: CheckpointRecord): Checkpoint {
  return {
    id: record.id as CheckpointId,
    documentId: record.documentId as DocumentId,
    revisionId: record.revisionId as RevisionId,
    authorMembershipId: record.authorMembershipId as WorkspaceMembershipId,
    message: record.message,
    createdAt: record.createdAt,
    snapshotArtifactRef: record.snapshotArtifact.key,
  };
}

function toArtifactCreateData(
  artifact: StoredCheckpointSnapshotArtifact,
): CheckpointArtifactCreateData {
  return {
    documentId: artifact.documentId,
    key: artifact.storageKey,
    kind: "checkpointSnapshot",
    contentType: artifact.contentType,
    checksumSha256: artifact.checksumSha256,
    sizeBytes: BigInt(artifact.sizeBytes),
    metadata: artifact.metadata,
  };
}

function toRevisionCreateData(
  input: CreateCheckpointInput,
  revisionId: string,
  snapshotArtifactId: string,
): RevisionCreateData {
  return {
    id: revisionId,
    documentId: input.documentId,
    authorMembershipId: input.authorMembershipId,
    source: "checkpoint",
    message: input.message,
    snapshotArtifactId,
  };
}

function toCheckpointCreateData(
  input: CreateCheckpointInput,
  checkpointId: CheckpointId,
  revisionId: string,
  snapshotArtifactId: string,
): CheckpointCreateData {
  return {
    id: checkpointId,
    documentId: input.documentId,
    revisionId,
    authorMembershipId: input.authorMembershipId,
    message: input.message,
    snapshotArtifactId,
  };
}

function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}
