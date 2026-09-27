import { strict as assert } from "node:assert";
import { test } from "node:test";

import { ForbiddenException, UnauthorizedException } from "@nestjs/common";

import { DocumentCollaborationSessionController } from "@/modules/collaboration/interfaces/document-collaboration-session.controller.js";
import type {
  CollaborationDocumentId,
  CollaborationMembershipId,
  CollaborationUserId,
  CollaborationWorkspaceId,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import type {
  IssueCollaborationSessionInput,
  IssueCollaborationSessionUseCase,
  IssuedCollaborationSession,
} from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";
import type { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";

const documentWorkspaceMembership = {
  id: "member_alice_review",
  userId: "user_alice",
  workspaceId: "workspace_review",
  displayName: "Alice",
  color: "#0969da",
  role: "editor",
} as const;

test("collaboration session route issues the token for the document workspace membership", async () => {
  const inputs: IssueCollaborationSessionInput[] = [];
  const controller = createController({
    access: { requireDocumentAccess: async () => ({ membership: documentWorkspaceMembership }) },
    issue: async (input) => {
      inputs.push(input);
      return issuedSession();
    },
  });

  const response = await controller.createDocumentCollaborationSession(
    "document_review_plan",
    "rme_session=opaque",
  );

  assert.deepEqual(inputs[0]?.membership, {
    id: "member_alice_review",
    userId: "user_alice",
    workspaceId: "workspace_review",
    role: "editor",
  });
  assert.deepEqual(response.connection, {
    token: "signed-token",
    expiresAt: "2026-09-26T00:02:00.000Z",
    access: "write",
  });
});

test("collaboration session route rejects requests without an authenticated session", async () => {
  const controller = createController({
    access: {
      requireDocumentAccess: async () => {
        throw new UnauthorizedException("Authentication is required.");
      },
    },
    issue: async () => {
      throw new Error("must not issue without a session");
    },
  });

  await assert.rejects(
    controller.createDocumentCollaborationSession("document_review_plan", undefined),
    UnauthorizedException,
  );
});

test("collaboration session route refuses when the policy grants no access", async () => {
  const controller = createController({
    access: { requireDocumentAccess: async () => ({ membership: documentWorkspaceMembership }) },
    issue: async () => null,
  });

  await assert.rejects(
    controller.createDocumentCollaborationSession("document_review_plan", "rme_session=opaque"),
    ForbiddenException,
  );
});

function createController(fakes: {
  access: { requireDocumentAccess: (...args: never[]) => Promise<unknown> };
  issue: (input: IssueCollaborationSessionInput) => Promise<IssuedCollaborationSession | null>;
}): DocumentCollaborationSessionController {
  return new DocumentCollaborationSessionController(
    { execute: fakes.issue } as unknown as IssueCollaborationSessionUseCase,
    fakes.access as unknown as ProductApiAccessService,
  );
}

function issuedSession(): IssuedCollaborationSession {
  const member = {
    id: "member_alice_review" as CollaborationMembershipId,
    userId: "user_alice" as CollaborationUserId,
    workspaceId: "workspace_review" as CollaborationWorkspaceId,
    displayName: "Alice",
    color: "#0969da",
  };

  return {
    session: {
      documentId: "document_review_plan" as CollaborationDocumentId,
      documentKey: "workspace_review/document_review_plan",
      realtimeUrl: "ws://127.0.0.1:1234",
      currentMember: member,
      allowedMembers: [member],
      sync: { status: "synced", pendingLocalEdits: 0, lastSyncedAt: null },
      documentArchived: false,
    },
    connection: {
      token: "signed-token",
      expiresAt: new Date("2026-09-26T00:02:00.000Z"),
      access: "write",
    },
  };
}
