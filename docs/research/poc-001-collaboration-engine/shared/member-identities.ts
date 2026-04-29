import type { MemberIdentity } from "./adapter-contract";

export const POC_WORKSPACE_ID = "workspace-collab-poc";
export const POC_PROJECT_ID = "project-launch-readiness";
export const POC_FOLDER_ID = "folder-editor-skeleton";

export const POC_MEMBERS = [
  {
    memberId: "member-alice",
    userId: "user-alice",
    workspaceId: POC_WORKSPACE_ID,
    displayName: "Alice Kim",
    color: "#2563EB",
    initials: "AK",
    role: "owner",
  },
  {
    memberId: "member-bob",
    userId: "user-bob",
    workspaceId: POC_WORKSPACE_ID,
    displayName: "Bob Lee",
    color: "#059669",
    initials: "BL",
    role: "editor",
  },
  {
    memberId: "member-cora",
    userId: "user-cora",
    workspaceId: POC_WORKSPACE_ID,
    displayName: "Cora Lee",
    color: "#DC2626",
    initials: "CL",
    role: "reviewer",
  },
] as const satisfies readonly MemberIdentity[];

export type PocMemberId = (typeof POC_MEMBERS)[number]["memberId"];

export const POC_MEMBER_IDS = {
  alice: "member-alice",
  bob: "member-bob",
  cora: "member-cora",
} as const satisfies Record<string, PocMemberId>;

export function getPocMember(memberId: PocMemberId): MemberIdentity {
  const member = POC_MEMBERS.find((candidate) => candidate.memberId === memberId);

  if (!member) {
    throw new Error(`Unknown POC member: ${memberId}`);
  }

  return member;
}
