import { strict as assert } from "node:assert";
import { createHmac } from "node:crypto";
import { test } from "node:test";

import { createConnectionAuthenticator } from "./authenticate-connection.js";
import { CollaborationTokenRejectedError } from "./collaboration-token.js";

const signingMaterial = "rme-test-collab-token-signing-0123456789";
const documentName = "workspace_review/document_review_plan";
const now = new Date("2026-09-26T00:01:00.000Z");

function tokenFor(access: "read" | "write", overrides: Record<string, unknown> = {}): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: "rme-api",
      aud: "rme-collab",
      sub: "user_alice",
      principalKind: "user",
      membershipId: "member_alice",
      workspaceId: "workspace_review",
      documentId: "document_review_plan",
      documentKey: documentName,
      access,
      iat: 1790380800,
      exp: 1790380920,
      ...overrides,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", signingMaterial)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function payloadFor(token: string, name = documentName) {
  return { token, documentName: name, connectionConfig: { readOnly: false } };
}

const authenticate = createConnectionAuthenticator({
  signingSecret: signingMaterial,
  now: () => now,
});

test("connection authenticator opens read tokens as read-only connections", async () => {
  const payload = payloadFor(tokenFor("read"));

  const context = await authenticate(payload);

  assert.equal(payload.connectionConfig.readOnly, true);
  assert.equal(context.access, "read");
});

test("connection authenticator keeps write connections writable and sets the server-side principal", async () => {
  const payload = payloadFor(tokenFor("write"));

  const context = await authenticate(payload);

  assert.equal(payload.connectionConfig.readOnly, false);
  assert.deepEqual(context, {
    principal: {
      kind: "user",
      userId: "user_alice",
      membershipId: "member_alice",
      workspaceId: "workspace_review",
    },
    documentId: "document_review_plan",
    access: "write",
  });
});

test("connection authenticator refuses connections without a valid token for the document", async () => {
  await assert.rejects(authenticate(payloadFor("")), CollaborationTokenRejectedError);
  await assert.rejects(
    authenticate(payloadFor(tokenFor("write"), "workspace_review/document_other")),
    CollaborationTokenRejectedError,
  );
  await assert.rejects(
    authenticate(payloadFor(tokenFor("write", { exp: 1790380830 }))),
    CollaborationTokenRejectedError,
  );
});
