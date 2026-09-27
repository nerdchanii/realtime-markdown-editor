import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { test } from "node:test";

import {
  CollaborationTokenRejectedError,
  verifyCollaborationToken,
} from "./collaboration-token.js";

// 이 벡터는 apps/api/src/modules/collaboration/adapters/hmac-collaboration-token-signer.test.ts 와 같아야 한다.
const vectorSigningMaterial = "rme-test-collab-token-signing-0123456789";
const vectorToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJybWUtYXBpIiwiYXVkIjoicm1lLWNvbGxhYiIsInN1YiI6InVzZXJfYWxpY2UiLCJwcmluY2lwYWxLaW5kIjoidXNlciIsIm1lbWJlcnNoaXBJZCI6Im1lbWJlcl9hbGljZSIsIndvcmtzcGFjZUlkIjoid29ya3NwYWNlX3JldmlldyIsImRvY3VtZW50SWQiOiJkb2N1bWVudF9yZXZpZXdfcGxhbiIsImRvY3VtZW50S2V5Ijoid29ya3NwYWNlX3Jldmlldy9kb2N1bWVudF9yZXZpZXdfcGxhbiIsImFjY2VzcyI6IndyaXRlIiwiaWF0IjoxNzkwMzgwODAwLCJleHAiOjE3OTAzODA5MjB9.U6-B3imcEE6LVVzyvWHhvxinXE7Kf5KFgesS51fRhzg";
const vectorDocumentName = "workspace_review/document_review_plan";
const beforeExpiry = new Date("2026-09-26T00:01:00.000Z");

const baseClaims = {
  iss: "rme-api",
  aud: "rme-collab",
  sub: "user_alice",
  principalKind: "user",
  membershipId: "member_alice",
  workspaceId: "workspace_review",
  documentId: "document_review_plan",
  documentKey: vectorDocumentName,
  access: "write",
  iat: 1790380800,
  exp: 1790380920,
};

function verify(token: string | undefined, overrides: { documentName?: string; now?: Date } = {}) {
  return verifyCollaborationToken(token, {
    signingSecret: vectorSigningMaterial,
    documentName: overrides.documentName ?? vectorDocumentName,
    now: overrides.now ?? beforeExpiry,
  });
}

function assertRejected(run: () => unknown, reason: string): void {
  assert.throws(run, (error: unknown) => {
    assert.ok(error instanceof CollaborationTokenRejectedError);
    assert.equal(error.reason, reason);
    return true;
  });
}

function sign(claims: Record<string, unknown>, signingMaterial = vectorSigningMaterial): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac("sha256", signingMaterial)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

test("collab token verifier accepts the API-issued fixed vector", () => {
  const grant = verify(vectorToken);

  assert.deepEqual(grant, {
    principal: {
      kind: "user",
      userId: "user_alice",
      membershipId: "member_alice",
      workspaceId: "workspace_review",
    },
    documentId: "document_review_plan",
    documentKey: vectorDocumentName,
    access: "write",
    expiresAt: new Date("2026-09-26T00:02:00.000Z"),
  });
});

test("collab token verifier rejects expired tokens", () => {
  assertRejected(
    () => verify(vectorToken, { now: new Date("2026-09-26T00:02:00.000Z") }),
    "token-expired",
  );
  assertRejected(
    () => verify(vectorToken, { now: new Date("2026-09-26T01:00:00.000Z") }),
    "token-expired",
  );
});

test("collab token verifier rejects tokens for another document", () => {
  assertRejected(
    () => verify(vectorToken, { documentName: "workspace_review/document_other" }),
    "document-mismatch",
  );
  assertRejected(
    () => verify(vectorToken, { documentName: "workspace_other/document_review_plan" }),
    "document-mismatch",
  );
});

test("collab token verifier rejects forged signatures", () => {
  const [header, payload] = vectorToken.split(".");
  const forgedPayload = Buffer.from(
    JSON.stringify({ ...baseClaims, documentKey: "workspace_review/document_other" }),
  ).toString("base64url");

  assertRejected(
    () => verify(`${header}.${forgedPayload}.${vectorToken.split(".")[2]}`),
    "invalid-signature",
  );
  assertRejected(() => verify(`${header}.${payload}.AAAA`), "invalid-signature");
  assertRejected(() => verify(`${header}.${payload}.`), "invalid-signature");
  assertRejected(
    () => verify(sign(baseClaims, "another-signing-material-0123456789abcdef")),
    "invalid-signature",
  );
});

test("collab token verifier rejects missing and malformed tokens", () => {
  assertRejected(() => verify(undefined), "missing-token");
  assertRejected(() => verify(""), "missing-token");
  assertRejected(() => verify("not-a-token"), "malformed-token");
  assertRejected(() => verify("a.b.c.d"), "malformed-token");
});

test("collab token verifier rejects signed tokens with unexpected claims", () => {
  assertRejected(() => verify(sign({ ...baseClaims, iss: "someone-else" })), "invalid-claims");
  assertRejected(() => verify(sign({ ...baseClaims, aud: "rme-api" })), "invalid-claims");
  assertRejected(() => verify(sign({ ...baseClaims, access: "admin" })), "invalid-claims");
  assertRejected(() => verify(sign({ ...baseClaims, principalKind: "agent" })), "invalid-claims");
  assertRejected(() => verify(sign({ ...baseClaims, exp: "later" })), "invalid-claims");
  assertRejected(() => verify(sign({ ...baseClaims, sub: "" })), "invalid-claims");
});

test("collab token verifier returns read access for read-only tokens", () => {
  const grant = verify(sign({ ...baseClaims, access: "read" }));

  assert.equal(grant.access, "read");
});
