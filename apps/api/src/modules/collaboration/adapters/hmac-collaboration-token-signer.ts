import { createHmac } from "node:crypto";

import type {
  CollaborationTokenClaims,
  CollaborationTokenPolicy,
  CollaborationTokenSigner,
} from "@/modules/collaboration/ports/collaboration-token-signer.js";

// 협업 연결 token 은 HS256 JWT 형식이다: base64url(header).base64url(payload).base64url(signature).
// 검증은 apps/collab 이 같은 공유 secret 으로 한다. 두 쪽은 코드를 공유하지 않으므로
// wire claim 이름을 바꿀 때는 apps/collab/src/auth/collaboration-token.ts 와 고정 벡터 테스트를 함께 바꾼다.

export const COLLABORATION_TOKEN_ISSUER = "rme-api";
export const COLLABORATION_TOKEN_AUDIENCE = "rme-collab";

const MIN_SECRET_LENGTH = 32;
const DEFAULT_TTL_SECONDS = 120;
const MAX_TTL_SECONDS = 900;

export type CollaborationTokenConfig = CollaborationTokenPolicy &
  Readonly<{
    secret: string;
  }>;

export class HmacCollaborationTokenSigner implements CollaborationTokenSigner {
  constructor(private readonly secret: string) {
    assertUsableSecret(secret);
  }

  sign(claims: CollaborationTokenClaims): string {
    const header = encodeSegment({ alg: "HS256", typ: "JWT" });
    const payload = encodeSegment({
      iss: COLLABORATION_TOKEN_ISSUER,
      aud: COLLABORATION_TOKEN_AUDIENCE,
      sub: claims.principal.userId,
      principalKind: claims.principal.kind,
      membershipId: claims.membershipId,
      workspaceId: claims.workspaceId,
      documentId: claims.documentId,
      documentKey: claims.documentKey,
      access: claims.access,
      iat: toEpochSeconds(claims.issuedAt),
      exp: toEpochSeconds(claims.expiresAt),
    });
    const signingInput = `${header}.${payload}`;
    const signature = createHmac("sha256", this.secret).update(signingInput).digest("base64url");

    return `${signingInput}.${signature}`;
  }
}

export function readCollaborationTokenConfig(env: NodeJS.ProcessEnv): CollaborationTokenConfig {
  const secret = env.RME_COLLAB_TOKEN_SECRET?.trim() ?? "";
  assertUsableSecret(secret);

  return { secret, ttlSeconds: readTtlSeconds(env.RME_COLLAB_TOKEN_TTL_SECONDS) };
}

function assertUsableSecret(secret: string): void {
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `RME_COLLAB_TOKEN_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters.`,
    );
  }
}

function readTtlSeconds(value: string | undefined): number {
  if (!value || value.trim().length === 0) return DEFAULT_TTL_SECONDS;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > MAX_TTL_SECONDS) {
    throw new Error(
      `RME_COLLAB_TOKEN_TTL_SECONDS must be an integer between 1 and ${MAX_TTL_SECONDS}.`,
    );
  }
  return parsed;
}

function encodeSegment(value: Readonly<Record<string, unknown>>): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function toEpochSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
