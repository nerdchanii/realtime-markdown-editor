export type WorkspaceId = string & { readonly __brand: "WorkspaceId" };

export type Workspace = Readonly<{
  id: WorkspaceId;
  name: string;
}>;
