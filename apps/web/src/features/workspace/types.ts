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

export type WorkspaceDocumentCreateRequest = Readonly<{
  title: string;
  folderId?: string | null;
  projectId?: string | null;
}>;

export type WorkspaceNavigationViewModel = Readonly<{
  replacementPoint: string;
  label: string;
  workspaceId?: string;
  workspaceName?: string;
  workspaceDescription?: string;
  activeMembersLabel?: string;
  currentMemberLabel?: string;
  root?: WorkspaceNavigationNode;
  projects?: readonly WorkspaceNavigationProject[];
  selectedDocumentId?: string | null;
  onSelectDocument?: (selection: WorkspaceNavigationSelection) => void;
  onCreateDocument?: (request: WorkspaceDocumentCreateRequest) => void;
}>;

export type NormalizedWorkspaceNavigationViewModel = Required<
  Omit<WorkspaceNavigationViewModel, "onSelectDocument" | "onCreateDocument">
> &
  Pick<WorkspaceNavigationViewModel, "onSelectDocument" | "onCreateDocument">;
