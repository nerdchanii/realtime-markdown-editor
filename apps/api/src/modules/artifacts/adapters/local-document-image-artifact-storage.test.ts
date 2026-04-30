import { strict as assert } from "node:assert";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceId } from "@rme/contracts";

import { DocumentImageArtifactOwnerNotFoundError } from "@/modules/artifacts/ports/document-image-artifact-storage.js";
import { LocalDocumentImageArtifactStorage } from "./local-document-image-artifact-storage.js";

test("LocalDocumentImageArtifactStorage writes image bytes and metadata with document workspace context", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "rme-image-artifacts-"));

  try {
    const client = new FakeImageArtifactPersistenceClient();
    const storage = new LocalDocumentImageArtifactStorage(client, dataDir);
    const payload = Buffer.from("image bytes");

    const artifact = await storage.storeDocumentImage({
      documentId: "document_a" as DocumentId,
      filename: "Diagram 1.png",
      contentType: "image/png",
      checksumSha256: "b".repeat(64),
      sizeBytes: payload.byteLength,
      payload,
    });

    assert.equal(artifact.documentId, "document_a");
    assert.equal(artifact.workspaceId, "workspace_a");
    assert.equal(artifact.contentType, "image/png");
    assert.equal(artifact.checksumSha256, "b".repeat(64));
    assert.equal(artifact.sizeBytes, payload.byteLength);
    assert.equal(client.createdArtifact?.documentId, "document_a");
    assert.equal(client.createdArtifact?.kind, "image");
    assert.equal(client.createdArtifact?.contentType, "image/png");
    assert.equal(client.createdArtifact?.checksumSha256, "b".repeat(64));
    assert.equal(client.createdArtifact?.sizeBytes, BigInt(payload.byteLength));
    assert.deepEqual(client.createdArtifact?.metadata, {
      workspaceId: "workspace_a",
      documentId: "document_a",
      originalFilename: "Diagram 1.png",
      storageKey: artifact.storageKey,
    });
    assert.deepEqual(await readFile(join(dataDir, ...artifact.storageKey.split("/"))), payload);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("LocalDocumentImageArtifactStorage creates unique storage keys for repeated uploads", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "rme-image-artifacts-"));

  try {
    const client = new FakeImageArtifactPersistenceClient();
    const storage = new LocalDocumentImageArtifactStorage(client, dataDir);
    const upload = {
      documentId: "document_a" as DocumentId,
      filename: "Diagram 1.png",
      contentType: "image/png",
      checksumSha256: "b".repeat(64),
      sizeBytes: Buffer.byteLength("image bytes"),
      payload: Buffer.from("image bytes"),
    };

    const first = await storage.storeDocumentImage(upload);
    const second = await storage.storeDocumentImage(upload);

    assert.notEqual(first.storageKey, second.storageKey);
    assert.equal(client.createdArtifacts.length, 2);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("LocalDocumentImageArtifactStorage reports missing owner documents", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "rme-image-artifacts-"));

  try {
    const client = new FakeImageArtifactPersistenceClient();
    const storage = new LocalDocumentImageArtifactStorage(client, dataDir);

    await assert.rejects(
      () =>
        storage.storeDocumentImage({
          documentId: "document_missing" as DocumentId,
          filename: "missing.png",
          contentType: "image/png",
          checksumSha256: "c".repeat(64),
          sizeBytes: Buffer.byteLength("image bytes"),
          payload: Buffer.from("image bytes"),
        }),
      (error) =>
        error instanceof DocumentImageArtifactOwnerNotFoundError &&
        error.documentId === "document_missing",
    );
    assert.equal(client.createdArtifacts.length, 0);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});

type ArtifactCreateData = Readonly<{
  documentId: string;
  key: string;
  kind: string;
  contentType: string;
  checksumSha256: string;
  sizeBytes: bigint;
  metadata: unknown;
}>;

class FakeImageArtifactPersistenceClient {
  createdArtifact: ArtifactCreateData | null = null;
  readonly createdArtifacts: ArtifactCreateData[] = [];

  readonly document = {
    findUnique: async ({ where }: { where: { id: string } }) => {
      if (where.id !== "document_a") return null;
      return { id: "document_a", folder: { workspaceId: "workspace_a" as WorkspaceId } };
    },
  };

  readonly artifact = {
    create: async ({ data }: { data: ArtifactCreateData }) => {
      this.createdArtifact = data;
      this.createdArtifacts.push(data);
      return {
        id: `artifact_image_${this.createdArtifacts.length}`,
        documentId: data.documentId,
        key: data.key,
        contentType: data.contentType,
        checksumSha256: data.checksumSha256,
        sizeBytes: data.sizeBytes,
        metadata: data.metadata,
      };
    },
  };
}
