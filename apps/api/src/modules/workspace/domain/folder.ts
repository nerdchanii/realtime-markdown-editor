import type { ProjectId } from "@/modules/workspace/domain/project.js";

export type FolderId = string & { readonly __brand: "FolderId" };

export type Folder = Readonly<{
  id: FolderId;
  projectId: ProjectId;
  name: string;
}>;
