import type {
  ArtifactReferenceDto,
  AutosaveSnapshotDto,
  BacklinkDto,
  CheckpointDto,
  CollaborationSessionDto,
  DocumentDetailDto,
  DocumentPropertyDto,
  DocumentPropertyValueDto,
  DocumentSyncStateDto,
  FolderDto,
  ProjectDto,
  PublicationDto,
  RealtimeMemberDto,
  RevisionDto,
  SeedReviewContextDto,
  UserDto,
  WorkspaceDto,
  WorkspaceMemberDto,
} from "@rme/contracts";

import type { DocumentPropertyValue } from "@/modules/documents/domain/document-property.js";
import type {
  SeedArtifactReference,
  SeedAutosaveSnapshot,
  SeedBacklink,
  SeedCheckpoint,
  SeedCollaborationSession,
  SeedDocument,
  SeedDocumentSyncState,
  SeedFolder,
  SeedProject,
  SeedPublication,
  SeedRevision,
  SeedReviewContext,
  SeedWorkspace,
} from "@/modules/review-context/use-cases/seed-review-context.js";

export function mapSeedReviewContextToDto(seed: SeedReviewContext): SeedReviewContextDto {
  const members = seed.members.map(mapWorkspaceMemberToDto);
  const documents = seed.documents.map(mapDocumentToDto);
  const folders = seed.folders.map(mapFolderToDto);

  return {
    currentMemberId: seed.currentMemberId,
    users: seed.users.map(mapUserToDto),
    workspace: mapWorkspaceToDto(seed.workspace),
    project: mapProjectToDto(seed.project),
    folder: mapFolderToDto(seed.selectedFolder),
    folders,
    document: mapDocumentToDto(seed.selectedDocument),
    documents,
    members,
    backlinks: seed.backlinks.map(mapBacklinkToDto),
    collaboration: mapCollaborationSessionToDto(seed.collaboration),
    revisions: seed.revisions.map(mapRevisionToDto),
    checkpoints: seed.checkpoints.map(mapCheckpointToDto),
    publications: seed.publications.map(mapPublicationToDto),
    autosaves: seed.autosaves.map(mapAutosaveToDto),
  };
}

function mapUserToDto(user: SeedReviewContext["users"][number]): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

function mapWorkspaceMemberToDto(member: SeedReviewContext["members"][number]): WorkspaceMemberDto {
  return {
    id: member.id,
    userId: member.userId,
    workspaceId: member.workspaceId,
    displayName: member.displayName,
    color: member.color,
    role: member.role,
  };
}

function mapRealtimeMemberToDto(member: SeedReviewContext["members"][number]): RealtimeMemberDto {
  return {
    id: member.id,
    userId: member.userId,
    workspaceId: member.workspaceId,
    displayName: member.displayName,
    color: member.color,
  };
}

function mapWorkspaceToDto(workspace: SeedWorkspace): WorkspaceDto {
  return {
    id: workspace.id,
    name: workspace.name,
    rootFolderId: workspace.rootFolderId,
  };
}

function mapProjectToDto(project: SeedProject): ProjectDto {
  return {
    id: project.id,
    workspaceId: project.workspaceId,
    name: project.name,
    rootFolderId: project.rootFolderId,
  };
}

function mapFolderToDto(folder: SeedFolder): FolderDto {
  return {
    id: folder.id,
    workspaceId: folder.workspaceId,
    projectId: folder.projectId,
    name: folder.name,
    kind: folder.kind,
    parentFolderId: folder.parentFolderId,
  };
}

function mapDocumentToDto(document: SeedDocument): DocumentDetailDto {
  return {
    id: document.id,
    folderId: document.folderId,
    title: document.title,
    state: document.state,
    latestRevisionId: document.latestRevisionId,
    publishedRevisionId: document.publishedRevisionId,
    markdownBody: document.markdownBody,
    properties: document.properties.map(mapDocumentPropertyToDto),
  };
}

function mapDocumentPropertyToDto(
  property: SeedDocument["properties"][number],
): DocumentPropertyDto {
  return {
    key: property.key,
    value: mapDocumentPropertyValueToDto(property.value),
  };
}

function mapDocumentPropertyValueToDto(value: DocumentPropertyValue): DocumentPropertyValueDto {
  switch (value.type) {
    case "text":
      return { type: "text", value: value.value };
    case "status":
      return { type: "status", value: value.value };
    case "date":
      return { type: "date", value: value.value };
    case "member":
      return { type: "member", value: value.value };
    case "checkbox":
      return { type: "checkbox", value: value.value };
  }
}

function mapArtifactToDto(artifact: SeedArtifactReference): ArtifactReferenceDto {
  return {
    key: artifact.key,
    contentType: artifact.contentType,
    checksumSha256: artifact.checksumSha256,
    sizeBytes: artifact.sizeBytes,
  };
}

function mapBacklinkToDto(backlink: SeedBacklink): BacklinkDto {
  return {
    sourceDocumentId: backlink.sourceDocumentId,
    targetDocumentId: backlink.targetDocumentId,
    markdownHref: backlink.markdownHref,
    sourceTitle: backlink.sourceTitle,
    preview: backlink.preview,
  };
}

function mapRevisionToDto(revision: SeedRevision): RevisionDto {
  return {
    id: revision.id,
    documentId: revision.documentId,
    authorMembershipId: revision.authorMembershipId,
    source: revision.source,
    message: revision.message,
    createdAt: revision.createdAt.toISOString(),
    snapshotArtifact: mapArtifactToDto(revision.snapshotArtifact),
  };
}

function mapCheckpointToDto(checkpoint: SeedCheckpoint): CheckpointDto {
  return {
    id: checkpoint.id,
    documentId: checkpoint.documentId,
    revisionId: checkpoint.revisionId,
    authorMembershipId: checkpoint.authorMembershipId,
    message: checkpoint.message,
    createdAt: checkpoint.createdAt.toISOString(),
    snapshotArtifact: mapArtifactToDto(checkpoint.snapshotArtifact),
  };
}

function mapPublicationToDto(publication: SeedPublication): PublicationDto {
  return {
    id: publication.id,
    documentId: publication.documentId,
    revisionId: publication.revisionId,
    publishedByMembershipId: publication.publishedByMembershipId,
    publishedAt: publication.publishedAt.toISOString(),
  };
}

function mapAutosaveToDto(autosave: SeedAutosaveSnapshot): AutosaveSnapshotDto {
  return {
    documentId: autosave.documentId,
    savedAt: autosave.savedAt.toISOString(),
    artifact: mapArtifactToDto(autosave.artifact),
    status: autosave.status,
  };
}

function mapDocumentSyncStateToDto(sync: SeedDocumentSyncState): DocumentSyncStateDto {
  return {
    status: sync.status,
    pendingLocalEdits: sync.pendingLocalEdits,
    lastSyncedAt: sync.lastSyncedAt?.toISOString() ?? null,
  };
}

function mapCollaborationSessionToDto(
  collaboration: SeedCollaborationSession,
): CollaborationSessionDto {
  return {
    documentId: collaboration.documentId,
    documentKey: collaboration.documentKey,
    realtimeUrl: collaboration.realtimeUrl,
    currentMemberId: collaboration.currentMemberId,
    members: collaboration.members.map(mapRealtimeMemberToDto),
    sync: mapDocumentSyncStateToDto(collaboration.sync),
  };
}
