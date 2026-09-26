import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  authorize,
  resolveDocumentContentAccess,
  type AuthorizationActor,
  type DocumentResource,
} from "@/modules/identity/domain/authorization-policy.js";
import type { UserId } from "@/modules/identity/domain/user.js";
import type {
  WorkspaceId,
  WorkspaceMembershipId,
  WorkspaceMembershipRole,
} from "@/modules/identity/domain/workspace-membership.js";

const workspace = "workspace_review" as WorkspaceId;

function actor(role: WorkspaceMembershipRole, workspaceId = workspace): AuthorizationActor {
  return {
    principal: { kind: "user", userId: "user_alice" as UserId },
    membership: { id: "member_alice" as WorkspaceMembershipId, workspaceId, role },
  };
}

function documentIn(archived = false, workspaceId = workspace): DocumentResource {
  return { kind: "document", workspaceId, archived };
}

test("authorization policy lets owners and editors read and write document content", () => {
  for (const role of ["owner", "editor"] as const) {
    assert.deepEqual(authorize(actor(role), "content.read", documentIn()), { allowed: true });
    assert.deepEqual(authorize(actor(role), "content.write", documentIn()), { allowed: true });
    assert.equal(resolveDocumentContentAccess(actor(role), documentIn()), "write");
  }
});

test("authorization policy limits viewers to reading document content", () => {
  assert.deepEqual(authorize(actor("viewer"), "content.read", documentIn()), { allowed: true });
  assert.deepEqual(authorize(actor("viewer"), "content.write", documentIn()), {
    allowed: false,
    reason: "role-not-permitted",
  });
  assert.equal(resolveDocumentContentAccess(actor("viewer"), documentIn()), "read");
});

test("authorization policy denies writes to archived documents but keeps reads", () => {
  assert.deepEqual(authorize(actor("owner"), "content.write", documentIn(true)), {
    allowed: false,
    reason: "document-archived",
  });
  assert.deepEqual(authorize(actor("owner"), "content.read", documentIn(true)), { allowed: true });
  assert.equal(resolveDocumentContentAccess(actor("editor"), documentIn(true)), "read");
});

test("authorization policy denies members of another workspace", () => {
  const outsider = actor("owner", "workspace_other" as WorkspaceId);

  assert.deepEqual(authorize(outsider, "content.read", documentIn()), {
    allowed: false,
    reason: "not-a-member",
  });
  assert.equal(resolveDocumentContentAccess(outsider, documentIn()), null);
});
