import type {
  CollaborationDocumentId,
  CollaborationMembershipId,
  CollaborationUserId,
  CollaborationWorkspaceId,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";

export type CollaborationAccess = "read" | "write";

/**
 * 협업 연결 token 에 묶이는 내용이다(ADR-0012 §1).
 * token 은 문서(documentId, documentKey), principal, 허용 action 에 묶인다.
 */
export type CollaborationTokenClaims = Readonly<{
  principal: Readonly<{ kind: "user"; userId: CollaborationUserId }>;
  membershipId: CollaborationMembershipId;
  workspaceId: CollaborationWorkspaceId;
  documentId: CollaborationDocumentId;
  documentKey: string;
  access: CollaborationAccess;
  issuedAt: Date;
  expiresAt: Date;
}>;

export type CollaborationTokenPolicy = Readonly<{
  ttlSeconds: number;
}>;

export const COLLABORATION_TOKEN_SIGNER = Symbol("COLLABORATION_TOKEN_SIGNER");
export const COLLABORATION_TOKEN_POLICY = Symbol("COLLABORATION_TOKEN_POLICY");

export interface CollaborationTokenSigner {
  sign(claims: CollaborationTokenClaims): string;
}
