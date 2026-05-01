import type { DocumentSummaryDto, ProjectDto } from "@rme/contracts";

import type {
  WorkspaceDocumentCreateRequest,
  WorkspaceFolderCreateRequest,
  WorkspaceFolderRenameRequest,
  WorkspaceNavigationNode,
  WorkspaceNavigationSelection,
} from "@/features/workspace";

import type { ProductWorkspaceModel } from "./product-workspace-types";

export function createWorkspaceNavigation(
  model: ProductWorkspaceModel,
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void,
  onCreateDocument: (request: WorkspaceDocumentCreateRequest) => void,
  onCreateFolder: (request: WorkspaceFolderCreateRequest) => void,
  onDeleteDocument: (documentId: string) => void,
  onDeleteFolder: (folderId: string) => void,
  onRenameFolder: (request: WorkspaceFolderRenameRequest) => void,
) {
  const memberships = model.session?.memberships ?? [];
  const currentMember = model.session?.currentMembership ?? null;
  const navigation = model.navigation;

  return {
    replacementPoint: "features.workspace.provider.product-api",
    label: navigation.workspace.name,
    workspaceId: navigation.workspace.id,
    workspaceName: navigation.workspace.name,
    workspaceDescription: "Documents and folders loaded from the workspace API.",
    activeMembersLabel: `${memberships.length} members available`,
    currentMemberLabel: currentMember ? `Editing as ${currentMember.displayName}` : "Signed out",
    root: createFolderNode(navigation, navigation.workspace.rootFolderId),
    projects: navigation.projects.map((project) => createNavigationProject(navigation, project)),
    ...createSelectionFields(model),
    defaultFolderId: navigation.projects[0]?.rootFolderId ?? navigation.workspace.rootFolderId,
    ...{ onSelectDocument, onCreateDocument, onCreateFolder },
    ...{ onDeleteDocument, onDeleteFolder, onRenameFolder },
  };
}

function createSelectionFields(model: ProductWorkspaceModel) {
  return {
    selectedDocumentId: model.selectedDocument.id,
    activeFolderId: model.selectedDocument.folderId,
  };
}

function createNavigationProject(
  navigation: ProductWorkspaceModel["navigation"],
  project: ProjectDto,
) {
  return {
    id: project.id,
    name: project.name,
    key: project.name.slice(0, 4).toUpperCase(),
    status: "Active",
    root: createFolderNode(navigation, project.rootFolderId),
  };
}

function createFolderNode(
  navigation: ProductWorkspaceModel["navigation"],
  folderId: string,
): WorkspaceNavigationNode {
  const folder = navigation.folders.find((candidate) => candidate.id === folderId);
  if (!folder) return createMissingFolderNode(folderId);

  return {
    id: folder.id,
    kind: folder.kind,
    name: folder.name,
    children: createFolderChildren(navigation, folder.id),
  };
}

function createFolderChildren(navigation: ProductWorkspaceModel["navigation"], folderId: string) {
  const childFolders = navigation.folders.filter(
    (candidate) => candidate.parentFolderId === folderId,
  );
  const childDocuments = navigation.documents.filter((document) => document.folderId === folderId);

  return [
    ...childFolders.map((childFolder) => createFolderNode(navigation, childFolder.id)),
    ...childDocuments.map(createDocumentNode),
  ];
}

function createMissingFolderNode(folderId: string): WorkspaceNavigationNode {
  return {
    id: folderId,
    kind: "regular",
    name: "Folder",
    children: [],
  };
}

function createDocumentNode(document: DocumentSummaryDto): WorkspaceNavigationNode {
  return {
    id: document.id,
    kind: "document",
    name: document.title,
    folderId: document.folderId,
    status: titleCase(document.state),
    updatedLabel: document.latestRevisionId ? "Revision available" : "No revision",
    ownerLabel: "Workspace",
  };
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
