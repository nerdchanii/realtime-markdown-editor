import type { UserId } from "@/modules/identity/domain/user.js";
import type {
  WorkspaceId,
  WorkspaceMembershipId,
  WorkspaceMembershipRole,
} from "@/modules/identity/domain/workspace-membership.js";

// ADR-0012 §1: 권한 판정은 하나의 policy(`authorize(actor, action, resource)`)로만 한다.
// 지금은 문서 본문 action(content.read, content.write)만 다룬다. 다른 action 과 진입점은
// 같은 함수에 차례로 옮긴다.

export type ContentAction = "content.read" | "content.write";

export type AuthorizationActor = Readonly<{
  principal: Readonly<{ kind: "user"; userId: UserId }>;
  membership: Readonly<{
    id: WorkspaceMembershipId;
    workspaceId: WorkspaceId;
    role: WorkspaceMembershipRole;
  }>;
}>;

export type DocumentResource = Readonly<{
  kind: "document";
  workspaceId: WorkspaceId;
  archived: boolean;
}>;

export type AuthorizationDenialReason = "not-a-member" | "role-not-permitted" | "document-archived";

export type AuthorizationDecision =
  | Readonly<{ allowed: true }>
  | Readonly<{ allowed: false; reason: AuthorizationDenialReason }>;

const contentActionsByRole: Readonly<Record<WorkspaceMembershipRole, readonly ContentAction[]>> = {
  owner: ["content.read", "content.write"],
  editor: ["content.read", "content.write"],
  viewer: ["content.read"],
};

export function authorize(
  actor: AuthorizationActor,
  action: ContentAction,
  resource: DocumentResource,
): AuthorizationDecision {
  if (actor.membership.workspaceId !== resource.workspaceId) {
    return { allowed: false, reason: "not-a-member" };
  }
  if (!contentActionsByRole[actor.membership.role].includes(action)) {
    return { allowed: false, reason: "role-not-permitted" };
  }
  if (action === "content.write" && resource.archived) {
    return { allowed: false, reason: "document-archived" };
  }

  return { allowed: true };
}

export type DocumentContentAccess = "read" | "write";

/** 실시간 연결처럼 한 번에 하나의 접근 수준을 정해야 하는 진입점을 위한 도우미다. */
export function resolveDocumentContentAccess(
  actor: AuthorizationActor,
  resource: DocumentResource,
): DocumentContentAccess | null {
  if (authorize(actor, "content.write", resource).allowed) return "write";
  if (authorize(actor, "content.read", resource).allowed) return "read";
  return null;
}
