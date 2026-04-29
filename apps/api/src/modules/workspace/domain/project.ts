import type { WorkspaceId } from "@/modules/workspace/domain/workspace.js";

export type ProjectId = string & { readonly __brand: "ProjectId" };

export type Project = Readonly<{
  id: ProjectId;
  workspaceId: WorkspaceId;
  name: string;
}>;
