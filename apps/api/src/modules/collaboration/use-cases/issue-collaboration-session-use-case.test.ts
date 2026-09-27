import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  type CollaborationDocumentId,
  type CollaborationMembershipId,
  type CollaborationSession,
  type CollaborationSessionLookup,
  type CollaborationSessionRepository,
  type CollaborationUserId,
  type CollaborationWorkspaceId,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import type {
  CollaborationTokenClaims,
  CollaborationTokenSigner,
} from "@/modules/collaboration/ports/collaboration-token-signer.js";
import {
  IssueCollaborationSessionUseCase,
  type CollaborationRequesterMembership,
} from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";

const issuedAt = new Date("2026-09-26T00:00:00.000Z");

const alice: CollaborationRequesterMembership = {
  id: "member_alice" as CollaborationMembershipId,
  userId: "user_alice" as CollaborationUserId,
  workspaceId: "workspace_review" as CollaborationWorkspaceId,
  role: "editor",
};

test("collaboration session issuance signs a write token bound to the document and principal", async () => {
  const { useCase, repository, signer } = setup();

  const issued = await useCase.execute({
    documentId: "document_review_plan" as CollaborationDocumentId,
    membership: alice,
  });

  assert.equal(repository.lookup?.currentMembershipId, "member_alice");
  assert.equal(issued?.connection.access, "write");
  assert.equal(issued?.connection.token, "signed-token");
  assert.equal(issued?.connection.expiresAt.toISOString(), "2026-09-26T00:02:00.000Z");
  assert.deepEqual(signer.claims, {
    principal: { kind: "user", userId: "user_alice" },
    membershipId: "member_alice",
    workspaceId: "workspace_review",
    documentId: "document_review_plan",
    documentKey: "workspace_review/document_review_plan",
    access: "write",
    issuedAt,
    expiresAt: new Date("2026-09-26T00:02:00.000Z"),
  });
});

test("collaboration session issuance gives viewers a read-only token", async () => {
  const { useCase, signer } = setup();

  const issued = await useCase.execute({
    documentId: "document_review_plan" as CollaborationDocumentId,
    membership: { ...alice, role: "viewer" },
  });

  assert.equal(issued?.connection.access, "read");
  assert.equal(signer.claims?.access, "read");
});

test("collaboration session issuance gives a read-only token for archived documents", async () => {
  const { useCase, signer } = setup({ documentArchived: true });

  const issued = await useCase.execute({
    documentId: "document_review_plan" as CollaborationDocumentId,
    membership: { ...alice, role: "owner" },
  });

  assert.equal(issued?.connection.access, "read");
  assert.equal(signer.claims?.access, "read");
});

test("collaboration session issuance signs nothing without document workspace membership", async () => {
  const { useCase, signer } = setup({ sessionFound: false });

  const issued = await useCase.execute({
    documentId: "document_other_workspace" as CollaborationDocumentId,
    membership: alice,
  });

  assert.equal(issued, null);
  assert.equal(signer.claims, null);
});

test("collaboration session issuance signs nothing when the membership belongs to another workspace", async () => {
  const { useCase, signer } = setup();

  const issued = await useCase.execute({
    documentId: "document_review_plan" as CollaborationDocumentId,
    membership: { ...alice, workspaceId: "workspace_other" as CollaborationWorkspaceId },
  });

  assert.equal(issued, null);
  assert.equal(signer.claims, null);
});

function setup(options: { documentArchived?: boolean; sessionFound?: boolean } = {}) {
  const repository = new RecordingCollaborationSessionRepository(
    options.documentArchived ?? false,
    options.sessionFound ?? true,
  );
  const signer = new RecordingTokenSigner();
  const useCase = new IssueCollaborationSessionUseCase(
    repository,
    signer,
    { ttlSeconds: 120 },
    () => issuedAt,
  );
  return { useCase, repository, signer };
}

class RecordingTokenSigner implements CollaborationTokenSigner {
  claims: CollaborationTokenClaims | null = null;

  sign(claims: CollaborationTokenClaims): string {
    this.claims = claims;
    return "signed-token";
  }
}

class RecordingCollaborationSessionRepository implements CollaborationSessionRepository {
  lookup: CollaborationSessionLookup | null = null;

  constructor(
    private readonly documentArchived: boolean,
    private readonly sessionFound: boolean,
  ) {}

  async findSession(lookup: CollaborationSessionLookup): Promise<CollaborationSession | null> {
    this.lookup = lookup;
    if (!this.sessionFound) return null;

    return {
      documentId: "document_review_plan" as CollaborationDocumentId,
      documentKey: "workspace_review/document_review_plan",
      realtimeUrl: "ws://127.0.0.1:1234",
      currentMember: {
        id: lookup.currentMembershipId,
        userId: "user_alice" as CollaborationUserId,
        workspaceId: "workspace_review" as CollaborationWorkspaceId,
        displayName: "Alice",
        color: "#0969da",
      },
      allowedMembers: [],
      sync: {
        status: "synced",
        pendingLocalEdits: 0,
        lastSyncedAt: null,
      },
      documentArchived: this.documentArchived,
    };
  }

  async findRuntimeSession(): Promise<CollaborationSession | null> {
    return null;
  }
}
