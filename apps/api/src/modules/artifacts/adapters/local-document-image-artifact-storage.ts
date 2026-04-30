import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type {
  DocumentImageArtifactStorage,
  StoredDocumentImageArtifact,
  StoreDocumentImageArtifactInput,
} from "@/modules/artifacts/ports/document-image-artifact-storage.js";
import { DocumentImageArtifactOwnerNotFoundError } from "@/modules/artifacts/ports/document-image-artifact-storage.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceId } from "@rme/contracts";

type ImageDocumentRecord = Readonly<{
  id: string;
  folder: Readonly<{
    workspaceId: string;
  }>;
}>;

type ImageArtifactRecord = Readonly<{
  id: string;
  documentId: string | null;
  key: string;
  contentType: string;
  checksumSha256: string;
  sizeBytes: bigint | number;
  metadata?: unknown;
}>;

type ImageArtifactCreateData = Readonly<{
  documentId: string;
  key: string;
  kind: "image";
  contentType: string;
  checksumSha256: string;
  sizeBytes: bigint;
  metadata: {
    workspaceId: string;
    documentId: string;
    originalFilename: string;
    storageKey: string;
  };
}>;

export type ImageArtifactPersistenceClient = Readonly<{
  document: {
    findUnique(args: {
      where: { id: string };
      select: { id: true; folder: { select: { workspaceId: true } } };
    }): Promise<ImageDocumentRecord | null>;
  };
  artifact: {
    create(args: { data: ImageArtifactCreateData }): Promise<ImageArtifactRecord>;
  };
}>;

export class LocalDocumentImageArtifactStorage implements DocumentImageArtifactStorage {
  constructor(
    private readonly client: ImageArtifactPersistenceClient,
    private readonly dataDir = process.env.RME_IMAGE_ARTIFACT_DATA_DIR ??
      join(process.cwd(), ".data", "image-artifacts"),
  ) {}

  async storeDocumentImage(
    input: StoreDocumentImageArtifactInput,
  ): Promise<StoredDocumentImageArtifact> {
    const workspaceId = await this.findDocumentWorkspaceId(input.documentId);
    const storageKey = storageKeyForImage({
      workspaceId,
      documentId: input.documentId,
      checksumSha256: input.checksumSha256,
      filename: input.filename,
    });

    await this.writeArtifactPayload(storageKey, input.payload);
    const artifact = await this.createImageArtifact(input, workspaceId, storageKey);

    return toStoredDocumentImageArtifact(artifact, input.documentId, workspaceId, storageKey);
  }

  private async findDocumentWorkspaceId(documentId: DocumentId): Promise<WorkspaceId> {
    const document = await this.client.document.findUnique({
      where: { id: documentId },
      select: { id: true, folder: { select: { workspaceId: true } } },
    });
    if (!document) throw new DocumentImageArtifactOwnerNotFoundError(documentId);

    return document.folder.workspaceId as WorkspaceId;
  }

  private async createImageArtifact(
    input: StoreDocumentImageArtifactInput,
    workspaceId: WorkspaceId,
    storageKey: string,
  ): Promise<ImageArtifactRecord> {
    return this.client.artifact.create({
      data: {
        documentId: input.documentId,
        key: storageKey,
        kind: "image",
        contentType: input.contentType,
        checksumSha256: input.checksumSha256,
        sizeBytes: BigInt(input.sizeBytes),
        metadata: {
          workspaceId,
          documentId: input.documentId,
          originalFilename: input.filename,
          storageKey,
        },
      },
    });
  }

  private async writeArtifactPayload(storageKey: string, payload: Uint8Array): Promise<void> {
    const artifactPath = join(this.dataDir, ...storageKey.split("/"));
    await mkdir(dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, payload);
  }
}

function toStoredDocumentImageArtifact(
  artifact: ImageArtifactRecord,
  documentId: DocumentId,
  workspaceId: WorkspaceId,
  storageKey: string,
): StoredDocumentImageArtifact {
  return {
    id: artifact.id,
    documentId,
    workspaceId,
    storageKey,
    contentType: artifact.contentType,
    checksumSha256: artifact.checksumSha256,
    sizeBytes: Number(artifact.sizeBytes),
  };
}

function storageKeyForImage(input: {
  workspaceId: WorkspaceId;
  documentId: DocumentId;
  checksumSha256: string;
  filename: string;
}): string {
  return [
    "local",
    "workspaces",
    input.workspaceId,
    "documents",
    input.documentId,
    "images",
    `${input.checksumSha256}-${randomUUID()}-${safeFilename(input.filename)}`,
  ].join("/");
}

function safeFilename(filename: string): string {
  const trimmed = filename
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return trimmed || "image";
}
