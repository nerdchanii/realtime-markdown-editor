import type {
  CollaborationMembershipId,
  CollaborationDocumentId,
  CollaborationSession,
  CollaborationSessionRepository,
  CollaborationUserId,
  CollaborationWorkspaceId,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import type {
  CollaborationAccess,
  CollaborationTokenPolicy,
  CollaborationTokenSigner,
} from "@/modules/collaboration/ports/collaboration-token-signer.js";
import { resolveDocumentContentAccess } from "@/modules/identity/domain/authorization-policy.js";
import type { UserId } from "@/modules/identity/domain/user.js";
import type {
  WorkspaceId,
  WorkspaceMembershipId,
  WorkspaceMembershipRole,
} from "@/modules/identity/domain/workspace-membership.js";

/** 세션에서 확인한, 요청 문서가 속한 workspace 의 멤버십이다. client 가 보낸 값이 아니다. */
export type CollaborationRequesterMembership = Readonly<{
  id: CollaborationMembershipId;
  userId: CollaborationUserId;
  workspaceId: CollaborationWorkspaceId;
  role: WorkspaceMembershipRole;
}>;

export type IssueCollaborationSessionInput = Readonly<{
  documentId: CollaborationDocumentId;
  membership: CollaborationRequesterMembership;
}>;

export type CollaborationConnectionGrant = Readonly<{
  token: string;
  expiresAt: Date;
  access: CollaborationAccess;
}>;

export type IssuedCollaborationSession = Readonly<{
  session: CollaborationSession;
  connection: CollaborationConnectionGrant;
}>;

export class IssueCollaborationSessionUseCase {
  constructor(
    private readonly sessions: CollaborationSessionRepository,
    private readonly tokens: CollaborationTokenSigner,
    private readonly tokenPolicy: CollaborationTokenPolicy,
    private readonly now: () => Date = () => new Date(),
  ) {}

  /** 권한이 없으면 null 을 돌려준다. 이때 token 은 만들지 않는다. */
  async execute(input: IssueCollaborationSessionInput): Promise<IssuedCollaborationSession | null> {
    const session = await this.sessions.findSession({
      documentId: input.documentId,
      currentMembershipId: input.membership.id,
    });
    if (!session) return null;

    const access = resolveDocumentContentAccess(
      {
        principal: { kind: "user", userId: input.membership.userId as string as UserId },
        membership: {
          id: input.membership.id as string as WorkspaceMembershipId,
          workspaceId: input.membership.workspaceId as string as WorkspaceId,
          role: input.membership.role,
        },
      },
      {
        kind: "document",
        // findSession 은 문서가 속한 workspace 의 멤버십만 currentMember 로 돌려준다.
        workspaceId: session.currentMember.workspaceId as string as WorkspaceId,
        archived: session.documentArchived,
      },
    );
    if (!access) return null;

    const issuedAt = this.now();
    const expiresAt = new Date(issuedAt.getTime() + this.tokenPolicy.ttlSeconds * 1000);
    const token = this.tokens.sign({
      principal: { kind: "user", userId: input.membership.userId },
      membershipId: input.membership.id,
      workspaceId: input.membership.workspaceId,
      documentId: session.documentId,
      documentKey: session.documentKey,
      access,
      issuedAt,
      expiresAt,
    });

    return { session, connection: { token, expiresAt, access } };
  }
}

export class LoadRuntimeCollaborationSessionUseCase {
  constructor(private readonly sessions: CollaborationSessionRepository) {}

  async execute(input: { documentKey: string }): Promise<CollaborationSession | null> {
    return this.sessions.findRuntimeSession({ documentKey: input.documentKey });
  }
}
