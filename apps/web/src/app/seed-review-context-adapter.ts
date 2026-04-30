import type { SeedReviewContextDto } from "@rme/contracts";

import type { CreatedReviewDocument, ReviewDocument } from "./created-review-document";
import { isSeedDocument } from "./created-review-document";
import type { AppFeatureProviders } from "./mock-providers";
import type { ReviewerRoute } from "./reviewer-route";
import { mapCheckpoint } from "./seed-review-context-history";

import type { DocumentBacklink, DocumentProperty } from "@/features/document";
import { createMockCollaborationAdapter } from "@/features/editor";
import type {
  WorkspaceDocumentCreateRequest,
  WorkspaceNavigationNode,
  WorkspaceNavigationSelection,
} from "@/features/workspace";

export function createSeedReviewProviders(
  context: SeedReviewContextDto,
  route: ReviewerRoute,
  selectedDocumentId: string | null,
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void,
  createdDocuments: readonly CreatedReviewDocument[] = [],
  onCreateDocument?: (request: WorkspaceDocumentCreateRequest) => void,
): AppFeatureProviders {
  const selectedDocument = findSelectedDocument(
    context,
    createdDocuments,
    selectedDocumentId,
    route.document,
  );
  const currentMember = findRouteMember(context, route.member);

  return {
    workspaceNavigation: createWorkspaceNavigation(
      context,
      createdDocuments,
      selectedDocument.id,
      currentMember.displayName,
      onSelectDocument,
      onCreateDocument,
    ),
    documentContext: createDocumentContext(context, selectedDocument),
    editorWorkspace: createEditorWorkspace(context, currentMember, selectedDocument),
    editorCollaborationAdapter: createMockCollaborationAdapter(),
    historyInspector: createHistoryInspector(context, selectedDocument.id),
  };
}

function createWorkspaceNavigation(
  context: SeedReviewContextDto,
  createdDocuments: readonly CreatedReviewDocument[],
  selectedDocumentId: string,
  currentMemberName: string,
  onSelectDocument: (selection: WorkspaceNavigationSelection) => void,
  onCreateDocument?: (request: WorkspaceDocumentCreateRequest) => void,
) {
  return {
    replacementPoint: "features.workspace.provider.seed-review-context",
    label: context.workspace.name,
    workspaceId: context.workspace.id,
    workspaceName: context.workspace.name,
    workspaceDescription: `${context.members.length} workspace members with seeded review data.`,
    activeMembersLabel: `${context.members.length} members available`,
    currentMemberLabel: `Editing as ${currentMemberName}`,
    root: createFolderNode(context, createdDocuments, context.workspace.rootFolderId),
    projects: [createNavigationProject(context, createdDocuments)],
    selectedDocumentId,
    onSelectDocument,
    ...(onCreateDocument ? { onCreateDocument } : {}),
  };
}

function createNavigationProject(
  context: SeedReviewContextDto,
  createdDocuments: readonly CreatedReviewDocument[],
) {
  return {
    id: context.project.id,
    name: context.project.name,
    key: "Seed",
    status: "Review context",
    root: createFolderNode(context, createdDocuments, context.project.rootFolderId),
  };
}

function createDocumentContext(context: SeedReviewContextDto, document: ReviewDocument) {
  return {
    replacementPoint: "features.document.provider.seed-review-context",
    label: "Seeded document context",
    documentId: document.id,
    title: document.title,
    path: createDocumentPath(context, document.folderId, document.title).join(" / "),
    properties: isSeedDocument(document)
      ? document.properties.map((property) => mapProperty(context, property))
      : [],
    backlinks: context.backlinks.map(mapBacklink),
  };
}

function createEditorWorkspace(
  context: SeedReviewContextDto,
  currentMember: SeedReviewContextDto["members"][number],
  document: ReviewDocument,
) {
  return {
    replacementPoint: "features.editor.provider.seed-review-context",
    label: `${document.title} (${currentMember.displayName})`,
    documentId: document.id,
    markdown: document.markdownBody,
    syncStatus: mapSyncStatus(context),
    presence: context.members.map((member) => ({
      id: member.displayName.toLowerCase(),
      name: member.displayName,
      color: member.color,
      range: member.id === currentMember.id ? "editing locally" : "reviewing selection",
    })),
    ...(isSeedDocument(document) ? { collaborationSession: context.collaboration } : {}),
  };
}

function createHistoryInspector(context: SeedReviewContextDto, documentId: string) {
  return {
    replacementPoint: "features.history.provider.seed-review-context",
    label: "Seeded revision history",
    checkpoints: context.checkpoints
      .filter((checkpoint) => checkpoint.documentId === documentId)
      .map((checkpoint) => mapCheckpoint(context, checkpoint)),
  };
}

function createFolderNode(
  context: SeedReviewContextDto,
  createdDocuments: readonly CreatedReviewDocument[],
  folderId: string,
): WorkspaceNavigationNode {
  const folder = context.folders.find((candidate) => candidate.id === folderId) ?? context.folder;
  const childFolders = context.folders.filter(
    (candidate) => candidate.parentFolderId === folder.id,
  );
  const childDocuments = [
    ...context.documents.filter((document) => document.folderId === folder.id),
    ...createdDocuments.filter((document) => document.folderId === folder.id),
  ];

  return {
    id: folder.id,
    kind: folder.kind,
    name: folder.name,
    children: [
      ...childFolders.map((childFolder) =>
        createFolderNode(context, createdDocuments, childFolder.id),
      ),
      ...childDocuments.map((document) => createDocumentNode(document)),
    ],
  };
}

function createDocumentNode(document: ReviewDocument) {
  return {
    id: document.id,
    kind: "document" as const,
    name: document.title,
    folderId: document.folderId,
    status: isSeedDocument(document) ? document.state : "Draft",
    updatedLabel: isSeedDocument(document)
      ? document.latestRevisionId
        ? "Revision available"
        : "No revision"
      : "Local draft",
    ownerLabel: isSeedDocument(document) ? "Seed" : "Reviewer local",
  };
}

function findSelectedDocument(
  context: SeedReviewContextDto,
  createdDocuments: readonly CreatedReviewDocument[],
  selectedDocumentId: string | null,
  routeDocument: string,
) {
  const requestedDocumentId =
    routeDocument === "seed-review-plan" ? context.document.id : routeDocument;

  return (
    createdDocuments.find((document) => document.id === selectedDocumentId) ??
    context.documents.find((document) => document.id === selectedDocumentId) ??
    context.documents.find((document) => document.id === requestedDocumentId) ??
    context.document
  );
}

function findRouteMember(context: SeedReviewContextDto, routeMember: string) {
  const routeMemberKeys = routeMember
    .toLowerCase()
    .split("|")
    .map((member) => member.trim())
    .filter(Boolean);

  return (
    context.members.find((member) => routeMemberKeys.includes(member.displayName.toLowerCase())) ??
    context.members.find((member) => routeMemberKeys.includes(member.id.toLowerCase())) ??
    context.members.find((member) => routeMemberKeys.includes(member.id.replace("member_", ""))) ??
    context.members.find((member) => member.id === context.currentMemberId) ??
    firstMember(context)
  );
}

function firstMember(context: SeedReviewContextDto): SeedReviewContextDto["members"][number] {
  const member = context.members[0];

  if (!member) {
    throw new Error("Seed review context must include at least one member");
  }

  return member;
}

function createDocumentPath(context: SeedReviewContextDto, folderId: string, title: string) {
  const folder = context.folders.find((candidate) => candidate.id === folderId);
  const projectName = folder?.projectId ? context.project.name : context.workspace.name;

  return [context.workspace.name, projectName, folder?.name ?? "Folder", title];
}

function mapProperty(
  context: SeedReviewContextDto,
  property: SeedReviewContextDto["document"]["properties"][number],
): DocumentProperty {
  return {
    label: property.key,
    value: formatPropertyValue(context, property.value),
    tone: property.value.type === "status" ? "warning" : "neutral",
  };
}

function formatPropertyValue(
  context: SeedReviewContextDto,
  property: SeedReviewContextDto["document"]["properties"][number]["value"],
) {
  if (property.type === "member") {
    return (
      context.members.find((member) => member.id === property.value)?.displayName ?? property.value
    );
  }

  return String(property.value);
}

function mapBacklink(backlink: SeedReviewContextDto["backlinks"][number]): DocumentBacklink {
  return {
    title: backlink.sourceTitle,
    source: backlink.markdownHref,
    excerpt: backlink.preview,
  };
}

function mapSyncStatus(context: SeedReviewContextDto) {
  const { sync } = context.collaboration;

  return {
    label: sync.status,
    detail: sync.lastSyncedAt ? `Last synced ${sync.lastSyncedAt}` : "Waiting for sync",
    pendingEdits: sync.pendingLocalEdits,
  };
}
