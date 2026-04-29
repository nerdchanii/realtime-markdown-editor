import type { UserId } from "@/modules/identity/domain/user.js";

export type WorkspaceMembershipId = string & { readonly __brand: "WorkspaceMembershipId" };
export type WorkspaceId = string & { readonly __brand: "WorkspaceId" };

export type WorkspaceMembershipRole = "owner" | "editor" | "viewer";

export type WorkspaceMembership = Readonly<{
  id: WorkspaceMembershipId;
  userId: UserId;
  workspaceId: WorkspaceId;
  displayName: string;
  color: string;
  role: WorkspaceMembershipRole;
}>;
