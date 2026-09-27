import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { test } from "node:test";

import {
  HmacCollaborationTokenSigner,
  readCollaborationTokenConfig,
} from "@/modules/collaboration/adapters/hmac-collaboration-token-signer.js";
import type {
  CollaborationDocumentId,
  CollaborationMembershipId,
  CollaborationUserId,
  CollaborationWorkspaceId,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import type { CollaborationTokenClaims } from "@/modules/collaboration/ports/collaboration-token-signer.js";

// 이 벡터는 apps/collab/src/auth/collaboration-token.spec.ts 와 같아야 한다.
// 발급(api)과 검증(collab)은 코드를 공유하지 않으므로, 두 테스트가 같은 문자열을 확인해 형식이 어긋나지 않게 한다.
const vectorSigningMaterial = "rme-test-collab-token-signing-0123456789";
const vectorToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJybWUtYXBpIiwiYXVkIjoicm1lLWNvbGxhYiIsInN1YiI6InVzZXJfYWxpY2UiLCJwcmluY2lwYWxLaW5kIjoidXNlciIsIm1lbWJlcnNoaXBJZCI6Im1lbWJlcl9hbGljZSIsIndvcmtzcGFjZUlkIjoid29ya3NwYWNlX3JldmlldyIsImRvY3VtZW50SWQiOiJkb2N1bWVudF9yZXZpZXdfcGxhbiIsImRvY3VtZW50S2V5Ijoid29ya3NwYWNlX3Jldmlldy9kb2N1bWVudF9yZXZpZXdfcGxhbiIsImFjY2VzcyI6IndyaXRlIiwiaWF0IjoxNzkwMzgwODAwLCJleHAiOjE3OTAzODA5MjB9.U6-B3imcEE6LVVzyvWHhvxinXE7Kf5KFgesS51fRhzg";

const vectorClaims: CollaborationTokenClaims = {
  principal: { kind: "user", userId: "user_alice" as CollaborationUserId },
  membershipId: "member_alice" as CollaborationMembershipId,
  workspaceId: "workspace_review" as CollaborationWorkspaceId,
  documentId: "document_review_plan" as CollaborationDocumentId,
  documentKey: "workspace_review/document_review_plan",
  access: "write",
  issuedAt: new Date("2026-09-26T00:00:00.000Z"),
  expiresAt: new Date("2026-09-26T00:02:00.000Z"),
};

test("collaboration token signer produces the shared fixed vector", () => {
  const signer = new HmacCollaborationTokenSigner(vectorSigningMaterial);

  assert.equal(signer.sign(vectorClaims), vectorToken);
});

test("collaboration token signer binds document, principal and access into an HS256 token", () => {
  const signer = new HmacCollaborationTokenSigner(vectorSigningMaterial);
  const [header, payload, signature] = signer.sign(vectorClaims).split(".");

  assert.deepEqual(decodeSegment(header), { alg: "HS256", typ: "JWT" });
  assert.deepEqual(decodeSegment(payload), {
    iss: "rme-api",
    aud: "rme-collab",
    sub: "user_alice",
    principalKind: "user",
    membershipId: "member_alice",
    workspaceId: "workspace_review",
    documentId: "document_review_plan",
    documentKey: "workspace_review/document_review_plan",
    access: "write",
    iat: 1790380800,
    exp: 1790380920,
  });
  assert.equal(
    signature,
    createHmac("sha256", vectorSigningMaterial).update(`${header}.${payload}`).digest("base64url"),
  );
});

test("collaboration token config refuses to start without a strong signing value", () => {
  assert.throws(() => readCollaborationTokenConfig({}), /RME_COLLAB_TOKEN_SECRET/);
  assert.throws(
    () => readCollaborationTokenConfig({ RME_COLLAB_TOKEN_SECRET: "short" }),
    /at least 32 characters/,
  );
  assert.throws(() => new HmacCollaborationTokenSigner(""), /RME_COLLAB_TOKEN_SECRET/);
});

test("collaboration token config defaults to a short TTL and rejects long ones", () => {
  const base = { RME_COLLAB_TOKEN_SECRET: vectorSigningMaterial };

  assert.equal(readCollaborationTokenConfig(base).ttlSeconds, 120);
  assert.equal(
    readCollaborationTokenConfig({ ...base, RME_COLLAB_TOKEN_TTL_SECONDS: "60" }).ttlSeconds,
    60,
  );
  assert.throws(
    () => readCollaborationTokenConfig({ ...base, RME_COLLAB_TOKEN_TTL_SECONDS: "3600" }),
    /RME_COLLAB_TOKEN_TTL_SECONDS/,
  );
});

function decodeSegment(segment: string | undefined): unknown {
  return JSON.parse(Buffer.from(segment ?? "", "base64url").toString("utf8"));
}
