import { createHmac, timingSafeEqual } from "node:crypto";

// API 가 발급한 협업 연결 token(HS256 JWT)을 검증한다(ADR-0012 §1).
// 발급 코드는 apps/api/src/modules/collaboration/adapters/hmac-collaboration-token-signer.ts 에 있다.
// collab 은 API source 를 import 하지 않으므로, wire claim 이름을 바꿀 때는 두 파일과 고정 벡터 테스트를 함께 바꾼다.

const EXPECTED_ISSUER = "rme-api";
const EXPECTED_AUDIENCE = "rme-collab";

export type CollaborationAccess = "read" | "write";

export type CollaborationPrincipal = Readonly<{
  kind: "user";
  userId: string;
  membershipId: string;
  workspaceId: string;
}>;

export type CollaborationGrant = Readonly<{
  principal: CollaborationPrincipal;
  documentId: string;
  documentKey: string;
  access: CollaborationAccess;
  expiresAt: Date;
}>;

export type CollaborationTokenRejection =
  | "missing-token"
  | "malformed-token"
  | "invalid-signature"
  | "invalid-claims"
  | "token-expired"
  | "document-mismatch";

export class CollaborationTokenRejectedError extends Error {
  constructor(readonly reason: CollaborationTokenRejection) {
    super(`Collaboration token rejected: ${reason}`);
    this.name = "CollaborationTokenRejectedError";
  }
}

export type VerifyCollaborationTokenOptions = Readonly<{
  signingSecret: string;
  documentName: string;
  now: Date;
}>;

export function verifyCollaborationToken(
  token: string | undefined,
  options: VerifyCollaborationTokenOptions,
): CollaborationGrant {
  if (!token) throw new CollaborationTokenRejectedError("missing-token");

  const segments = token.split(".");
  if (segments.length !== 3) throw new CollaborationTokenRejectedError("malformed-token");
  const [header, payload, signature] = segments as [string, string, string];

  if (!hasValidSignature(`${header}.${payload}`, signature, options.signingSecret)) {
    throw new CollaborationTokenRejectedError("invalid-signature");
  }

  const headerRecord = decodeSegment(header);
  if (headerRecord.alg !== "HS256") throw new CollaborationTokenRejectedError("malformed-token");

  const grant = readGrant(decodeSegment(payload));
  if (grant.expiresAt.getTime() <= options.now.getTime()) {
    throw new CollaborationTokenRejectedError("token-expired");
  }
  if (grant.documentKey !== options.documentName) {
    throw new CollaborationTokenRejectedError("document-mismatch");
  }

  return grant;
}

function hasValidSignature(signingInput: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(signingInput).digest();
  const actual = Buffer.from(signature, "base64url");
  // 길이가 다르면 timingSafeEqual 이 throw 하므로 먼저 확인한다.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function decodeSegment(segment: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
  } catch {
    throw new CollaborationTokenRejectedError("malformed-token");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new CollaborationTokenRejectedError("malformed-token");
  }
  return parsed as Record<string, unknown>;
}

function readGrant(claims: Record<string, unknown>): CollaborationGrant {
  if (claims.iss !== EXPECTED_ISSUER || claims.aud !== EXPECTED_AUDIENCE) {
    throw new CollaborationTokenRejectedError("invalid-claims");
  }
  if (claims.principalKind !== "user") throw new CollaborationTokenRejectedError("invalid-claims");
  if (claims.access !== "read" && claims.access !== "write") {
    throw new CollaborationTokenRejectedError("invalid-claims");
  }

  return {
    principal: {
      kind: "user",
      userId: readClaimString(claims.sub),
      membershipId: readClaimString(claims.membershipId),
      workspaceId: readClaimString(claims.workspaceId),
    },
    documentId: readClaimString(claims.documentId),
    documentKey: readClaimString(claims.documentKey),
    access: claims.access,
    expiresAt: new Date(readClaimEpochSeconds(claims.exp) * 1000),
  };
}

function readClaimString(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new CollaborationTokenRejectedError("invalid-claims");
  }
  return value;
}

function readClaimEpochSeconds(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new CollaborationTokenRejectedError("invalid-claims");
  }
  return value;
}
