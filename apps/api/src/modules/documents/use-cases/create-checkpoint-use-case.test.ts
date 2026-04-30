import { strict as assert } from "node:assert";
import { test } from "node:test";

import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import type {
  CheckpointRepository,
  CreateCheckpointInput,
} from "@/modules/documents/ports/checkpoint-repository.js";
import type { DocumentContentRepository } from "@/modules/documents/ports/document-content-repository.js";

import { CreateCheckpointUseCase } from "./create-checkpoint-use-case.js";

test("CreateCheckpointUseCase resolves the checkpoint Markdown snapshot from current content", async () => {
  const documentId = "document_a" as DocumentId;
  const checkpoints = new FakeCheckpointRepository();
  const content = new FakeDocumentContentRepository(documentId);
  const useCase = new CreateCheckpointUseCase(checkpoints, content);

  await useCase.execute({
    documentId,
    authorMembershipId: "member_alice" as WorkspaceMembershipId,
    message: "Server resolved checkpoint",
    resolveCurrentContent: true,
  });

  assert.equal(checkpoints.created?.markdownSnapshot, "# Current projection\n\nServer resolved.");
});

test("CreateCheckpointUseCase only uses a request snapshot as legacy fallback", async () => {
  const documentId = "document_legacy" as DocumentId;
  const checkpoints = new FakeCheckpointRepository();
  const content = new FakeDocumentContentRepository("document_missing" as DocumentId);
  const useCase = new CreateCheckpointUseCase(checkpoints, content);

  await useCase.execute({
    documentId,
    authorMembershipId: "member_alice" as WorkspaceMembershipId,
    message: "Legacy collaboration checkpoint",
    markdownSnapshot: "# Legacy collaboration snapshot",
  });

  assert.equal(checkpoints.created?.markdownSnapshot, "# Legacy collaboration snapshot");
});

test("CreateCheckpointUseCase resolves current content when explicitly required", async () => {
  const documentId = "document_a" as DocumentId;
  const checkpoints = new FakeCheckpointRepository();
  const content = new FakeDocumentContentRepository(documentId);
  const useCase = new CreateCheckpointUseCase(checkpoints, content);

  await useCase.execute({
    documentId,
    authorMembershipId: "member_alice" as WorkspaceMembershipId,
    message: "Product checkpoint",
    markdownSnapshot: "# Untrusted request body",
    resolveCurrentContent: true,
  });

  assert.equal(checkpoints.created?.markdownSnapshot, "# Current projection\n\nServer resolved.");
});

class FakeCheckpointRepository implements CheckpointRepository {
  created: CreateCheckpointInput | null = null;

  async createCheckpoint(input: CreateCheckpointInput) {
    this.created = input;
    return {
      checkpoint: {
        id: "checkpoint_a" as never,
        documentId: input.documentId,
        revisionId: "revision_a" as never,
        authorMembershipId: input.authorMembershipId,
        message: input.message,
        createdAt: new Date("2026-04-30T12:00:00.000Z"),
        snapshotArtifactRef: "checkpoints/checkpoint_a.md",
      },
      markdownBody: input.markdownSnapshot,
    };
  }

  async listCheckpoints() {
    return [];
  }

  async findCheckpointSnapshot() {
    return null;
  }
}

class FakeDocumentContentRepository implements DocumentContentRepository {
  constructor(private readonly documentId: DocumentId) {}

  async findCurrentContent(id: DocumentId) {
    if (id !== this.documentId) return null;
    return {
      documentId: id,
      markdownBody: "# Current projection\n\nServer resolved.",
      latestRevisionId: null,
      updatedAt: new Date("2026-04-30T12:00:00.000Z"),
    };
  }

  async saveCurrentContent(): Promise<never> {
    throw new Error("not used");
  }
}
