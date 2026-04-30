import { strict as assert } from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import type { CheckpointId } from "@/modules/documents/domain/checkpoint.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";

import { LocalCheckpointRepository } from "./local-checkpoint-repository.js";

test("LocalCheckpointRepository persists checkpoints across repository instances", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "rme-checkpoints-"));

  try {
    const firstRepository = new LocalCheckpointRepository(dataDir);
    const created = await firstRepository.createCheckpoint({
      documentId: "document_a" as DocumentId,
      authorMembershipId: "member_alice" as WorkspaceMembershipId,
      message: "Capture durable snapshot",
      markdownSnapshot: "# Durable snapshot",
    });

    const secondRepository = new LocalCheckpointRepository(dataDir);
    const listed = await secondRepository.listCheckpoints("document_a" as DocumentId);
    const inspected = await secondRepository.findCheckpointSnapshot(created.checkpoint.id);

    assert.equal(listed.length, 1);
    assert.equal(listed[0]?.id, created.checkpoint.id);
    assert.equal(listed[0]?.message, "Capture durable snapshot");
    assert.equal(inspected?.markdownBody, "# Durable snapshot");
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("LocalCheckpointRepository scopes checkpoint lists by document and sorts newest first", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "rme-checkpoints-"));

  try {
    const repository = new LocalCheckpointRepository(dataDir);
    const older = await repository.createCheckpoint({
      documentId: "document_a" as DocumentId,
      authorMembershipId: "member_alice" as WorkspaceMembershipId,
      message: "Older",
      markdownSnapshot: "Older body",
    });
    const otherDocument = await repository.createCheckpoint({
      documentId: "document_b" as DocumentId,
      authorMembershipId: "member_bob" as WorkspaceMembershipId,
      message: "Other document",
      markdownSnapshot: "Other body",
    });
    const newer = await repository.createCheckpoint({
      documentId: "document_a" as DocumentId,
      authorMembershipId: "member_bob" as WorkspaceMembershipId,
      message: "Newer",
      markdownSnapshot: "Newer body",
    });

    const listed = await repository.listCheckpoints("document_a" as DocumentId);
    const unknown = await repository.findCheckpointSnapshot("checkpoint_missing" as CheckpointId);

    assert.deepEqual(
      listed.map((checkpoint) => checkpoint.id),
      [newer.checkpoint.id, older.checkpoint.id],
    );
    assert.ok(!listed.some((checkpoint) => checkpoint.id === otherDocument.checkpoint.id));
    assert.equal(unknown, null);
  } finally {
    await rm(dataDir, { recursive: true, force: true });
  }
});
