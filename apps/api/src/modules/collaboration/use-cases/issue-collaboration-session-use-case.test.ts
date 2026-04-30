import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  type CollaborationDocumentId,
  type CollaborationMembershipId,
  type CollaborationUserId,
  type CollaborationWorkspaceId,
  type CollaborationSession,
  type CollaborationSessionRepository,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import { IssueCollaborationSessionUseCase } from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";

test("collaboration session issuance uses the authenticated membership instead of a public member id", async () => {
  const repository = new RecordingCollaborationSessionRepository();
  const useCase = new IssueCollaborationSessionUseCase(repository);

  const input = {
    documentId: "document_review_plan" as CollaborationDocumentId,
    currentMembershipId: "member_alice" as CollaborationMembershipId,
    memberId: "member_bob" as CollaborationMembershipId,
  } as unknown as Parameters<IssueCollaborationSessionUseCase["execute"]>[0];
  const session = await useCase.execute(input);

  assert.equal(repository.lookup?.currentMembershipId, "member_alice");
  assert.equal(session?.currentMember.id, "member_alice");
});

class RecordingCollaborationSessionRepository implements CollaborationSessionRepository {
  lookup: Readonly<{
    documentId: string;
    currentMembershipId: CollaborationMembershipId;
  }> | null = null;

  async findSession(lookup: {
    documentId: string;
    currentMembershipId: CollaborationMembershipId;
    memberId?: CollaborationMembershipId;
  }): Promise<CollaborationSession | null> {
    this.lookup = lookup;
    assert.equal(lookup.memberId, undefined);
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
    };
  }

  async findSeedSession(): Promise<CollaborationSession | null> {
    return null;
  }

  async findRuntimeSession(): Promise<CollaborationSession | null> {
    return null;
  }
}
