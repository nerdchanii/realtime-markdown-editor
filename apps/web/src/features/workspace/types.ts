export type WorkspaceTreeNodeKind =
  | "workspaceRoot"
  | "projectRoot"
  | "regular"
  | "inbox"
  | "document";

export type WorkspaceNavigationNode = Readonly<{
  id: string;
  kind: WorkspaceTreeNodeKind;
  name: string;
  children?: readonly WorkspaceNavigationNode[];
  folderId?: string;
  status?: string;
  updatedLabel?: string;
  ownerLabel?: string;
}>;

export type WorkspaceNavigationProject = Readonly<{
  id: string;
  name: string;
  key: string;
  status: string;
  root: WorkspaceNavigationNode;
}>;

export type WorkspaceNavigationSelection = Readonly<{
  workspaceId: string;
  projectId: string | null;
  documentId: string;
  folderId: string | null;
  title: string;
  path: readonly string[];
}>;

export type WorkspaceNavigationViewModel = Readonly<{
  replacementPoint: string;
  label: string;
  workspaceId?: string;
  workspaceName?: string;
  workspaceDescription?: string;
  activeMembersLabel?: string;
  root?: WorkspaceNavigationNode;
  projects?: readonly WorkspaceNavigationProject[];
  selectedDocumentId?: string | null;
  onSelectDocument?: (selection: WorkspaceNavigationSelection) => void;
}>;

export type NormalizedWorkspaceNavigationViewModel = Required<
  Omit<WorkspaceNavigationViewModel, "onSelectDocument">
> &
  Pick<WorkspaceNavigationViewModel, "onSelectDocument">;
