import type {
  BacklinkDto,
  DocumentDetailDto,
  DocumentPropertyDto,
  DocumentPropertyValueDto,
  WorkspaceMembershipId,
  WorkspaceMemberDto,
} from "@rme/contracts";

import type { DocumentBacklink, DocumentProperty } from "@/features/document";
import { createTiptapYjsCollaborationAdapter } from "@/features/editor";
import type {
  WorkspaceDocumentCreateRequest,
  WorkspaceFolderCreateRequest,
  WorkspaceFolderRenameRequest,
  WorkspaceNavigationSelection,
} from "@/features/workspace";

import type { AppFeatureProviders } from "./mock-providers";
import { createWorkspaceNavigation } from "./product-workspace-navigation";
import type { ProductWorkspaceModel } from "./product-workspace-types";

export function createProductProviders(
  model: ProductWorkspaceModel,
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void,
  onCreateDocument: (request: WorkspaceDocumentCreateRequest) => void,
  onCreateFolder: (request: WorkspaceFolderCreateRequest) => void,
  onDeleteDocument: (documentId: string) => void,
  onDeleteFolder: (folderId: string) => void,
  onRenameFolder: (request: WorkspaceFolderRenameRequest) => void,
  onDocumentPropertiesUpdated: () => void,
): AppFeatureProviders {
  const context = createProviderContext(model);

  return {
    workspaceNavigation: createWorkspaceNavigation(
      model,
      onSelectDocument,
      onCreateDocument,
      onCreateFolder,
      onDeleteDocument,
      onDeleteFolder,
      onRenameFolder,
    ),
    documentContext: createDocumentContext(model, context.memberships, onDocumentPropertiesUpdated),
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

function createDocumentContext(
  model: ProductWorkspaceModel,
  memberships: readonly WorkspaceMemberDto[],
  onPropertiesUpdated: () => void,
) {
  return {
    replacementPoint: "features.document.provider.product-api",
    label: "Document context",
    documentId: model.selectedDocument.id,
    title: model.selectedDocument.title,
    apiClient: model.apiClient,
    path: createDocumentPath(model.navigation, model.selectedDocument).join(" / "),
    properties: model.selectedDocument.properties.map((property) =>
      mapDocumentProperty(property, memberships),
    ),
    onPropertiesUpdated,
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
    rawValue: property.value.value,
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
