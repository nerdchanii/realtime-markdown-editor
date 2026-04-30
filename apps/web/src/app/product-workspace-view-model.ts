import type {
  BacklinkDto,
  DocumentDetailDto,
  DocumentPropertyDto,
  DocumentPropertyValueDto,
  DocumentSummaryDto,
  ProjectDto,
  WorkspaceMembershipId,
  WorkspaceMemberDto,
} from "@rme/contracts";

import type { DocumentBacklink, DocumentProperty } from "@/features/document";
import { createTiptapYjsCollaborationAdapter } from "@/features/editor";
import type {
  WorkspaceDocumentCreateRequest,
  WorkspaceNavigationNode,
  WorkspaceNavigationSelection,
} from "@/features/workspace";

import type { AppFeatureProviders } from "./mock-providers";
import type { ProductWorkspaceModel } from "./product-workspace-types";

export function createProductProviders(
  model: ProductWorkspaceModel,
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void,
  onCreateDocument: (request: WorkspaceDocumentCreateRequest) => void,
): AppFeatureProviders {
  const context = createProviderContext(model);

  return {
    workspaceNavigation: createWorkspaceNavigation(model, onSelectDocument, onCreateDocument),
    documentContext: createDocumentContext(model, context.memberships),
    editorWorkspace: createEditorWorkspace(model, context.memberships, context.currentMemberId),
    editorCollaborationAdapter: createTiptapYjsCollaborationAdapter(),
    historyInspector: createHistoryInspector(model, context.memberships, context.currentMemberId),
  };
}

function createProviderContext(model: ProductWorkspaceModel) {
  return {
    memberships: model.session?.memberships ?? [],
    currentMemberId: (model.session?.currentMembership?.id ?? null) as WorkspaceMembershipId | null,
  };
}

function createEditorWorkspace(
  model: ProductWorkspaceModel,
  memberships: readonly WorkspaceMemberDto[],
  currentMemberId: WorkspaceMembershipId | null,
) {
  return {
    replacementPoint: "features.editor.provider.product-api",
    label: model.selectedDocument.title,
    documentId: model.selectedDocument.id,
    collaborationSession: model.collaborationSession,
    markdown: model.markdownBody,
    apiClient: model.apiClient,
    syncStatus: createSyncStatus(),
    presence: memberships.map((member) => ({
      id: member.id,
      name: member.displayName,
      color: member.color,
      range: member.id === currentMemberId ? "editing locally" : "available",
    })),
  };
}

function createHistoryInspector(
  model: ProductWorkspaceModel,
  memberships: readonly WorkspaceMemberDto[],
  currentMemberId: WorkspaceMembershipId | null,
) {
  return {
    replacementPoint: "features.history.provider.product-api",
    label: "Revision history",
    documentId: model.selectedDocument.id,
    apiClient: model.apiClient,
    memberLabels: memberLabels(memberships),
    ...(currentMemberId ? { currentMemberId } : {}),
  };
}

function createWorkspaceNavigation(
  model: ProductWorkspaceModel,
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void,
  onCreateDocument: (request: WorkspaceDocumentCreateRequest) => void,
) {
  const memberships = model.session?.memberships ?? [];
  const currentMember = model.session?.currentMembership ?? null;

  return {
    replacementPoint: "features.workspace.provider.product-api",
    label: model.navigation.workspace.name,
    workspaceId: model.navigation.workspace.id,
    workspaceName: model.navigation.workspace.name,
    workspaceDescription: "Documents and folders loaded from the workspace API.",
    activeMembersLabel: `${memberships.length} members available`,
    currentMemberLabel: currentMember ? `Editing as ${currentMember.displayName}` : "Signed out",
    root: createFolderNode(model.navigation, model.navigation.workspace.rootFolderId),
    projects: model.navigation.projects.map((project) =>
      createNavigationProject(model.navigation, project),
    ),
    selectedDocumentId: model.selectedDocument.id,
    onSelectDocument,
    onCreateDocument,
  };
}

function createDocumentContext(
  model: ProductWorkspaceModel,
  memberships: readonly WorkspaceMemberDto[],
) {
  return {
    replacementPoint: "features.document.provider.product-api",
    label: "Document context",
    documentId: model.selectedDocument.id,
    title: model.selectedDocument.title,
    path: createDocumentPath(model.navigation, model.selectedDocument).join(" / "),
    properties: model.selectedDocument.properties.map((property) =>
      mapDocumentProperty(property, memberships),
    ),
    backlinks: model.backlinks.map(mapBacklink),
  };
}

function createSyncStatus() {
  return {
    label: "synced",
    detail: "Current Markdown projection loaded from product API",
    pendingEdits: 0,
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

function createDocumentPath(
  navigation: ProductWorkspaceModel["navigation"],
  document: DocumentDetailDto,
) {
  const folderPath = createFolderPath(navigation, document.folderId);
  return [navigation.workspace.name, ...folderPath, document.title];
}

function createFolderPath(
  navigation: ProductWorkspaceModel["navigation"],
  folderId: string,
): string[] {
  const folder = navigation.folders.find((candidate) => candidate.id === folderId);
  if (!folder) return [];

  const parentPath = folder.parentFolderId
    ? createFolderPath(navigation, folder.parentFolderId)
    : [];
  return [...parentPath, folder.name];
}

function mapDocumentProperty(
  property: DocumentPropertyDto,
  members: readonly WorkspaceMemberDto[],
): DocumentProperty {
  const value = formatPropertyValue(property.value, members);

  return {
    key: property.key,
    label: property.key,
    value,
    valueType: property.value.type,
    tone: property.value.type === "status" ? "warning" : "neutral",
  };
}

function formatPropertyValue(
  property: DocumentPropertyValueDto,
  members: readonly WorkspaceMemberDto[],
) {
  if (property.type === "member") {
    return members.find((member) => member.id === property.value)?.displayName ?? property.value;
  }

  return String(property.value);
}

function mapBacklink(backlink: BacklinkDto): DocumentBacklink {
  return {
    sourceDocumentId: backlink.sourceDocumentId,
    targetDocumentId: backlink.targetDocumentId,
    title: backlink.sourceTitle,
    source: backlink.markdownHref,
    excerpt: backlink.preview,
  };
}

function memberLabels(members: readonly WorkspaceMemberDto[]) {
  return Object.fromEntries(members.map((member) => [member.id, member.displayName]));
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
