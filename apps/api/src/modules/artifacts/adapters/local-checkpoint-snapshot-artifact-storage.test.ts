import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import type { DocumentId } from "@/modules/documents/domain/document.js";

import { LocalCheckpointSnapshotArtifactStorage } from "./local-checkpoint-snapshot-artifact-storage.js";

test("LocalCheckpointSnapshotArtifactStorage writes Markdown payload and artifact metadata", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "rme-checkpoint-artifacts-"));

  try {
    const client = new FakeCheckpointArtifactPersistenceClient();
    const storage = new LocalCheckpointSnapshotArtifactStorage(client, dataDir);
    const markdownBody = "# Persisted checkpoint\n\nArtifact payload.";

    const artifact = await storage.writeCheckpointSnapshot({
      documentId: "document_a" as DocumentId,
      checkpointId: "checkpoint_a",
      markdownBody,
    });

    assert.equal(artifact.documentId, "document_a");
    assert.equal(artifact.contentType, "text/markdown; charset=utf-8");
    assert.equal(artifact.checksumSha256, createHash("sha256").update(markdownBody).digest("hex"));
    assert.equal(artifact.sizeBytes, Buffer.byteLength(markdownBody, "utf8"));
    assert.deepEqual(artifact.metadata, {
      workspaceId: "workspace_a",
      documentId: "document_a",
      checkpointId: "checkpoint_a",
      storageKey: artifact.storageKey,
    });
    assert.equal(
      await readFile(join(dataDir, ...artifact.storageKey.split("/")), "utf8"),
      markdownBody,
    );
    assert.equal(await storage.readCheckpointSnapshot(artifact.storageKey), markdownBody);
    await storage.deleteCheckpointSnapshot(artifact.storageKey);
    assert.equal(await storage.readCheckpointSnapshot(artifact.storageKey), null);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});

class FakeCheckpointArtifactPersistenceClient {
  readonly document = {
    findUnique: async ({ where }: { where: { id: string } }) => {
      if (where.id !== "document_a") return null;
      return { id: "document_a", folder: { workspaceId: "workspace_a" } };
    },
  };
}
