import type {
  CreateAccountRequestDto,
  CreateWorkspaceMemberRequestDto,
  CreateProjectRequestDto,
  CreateDocumentRequestDto,
  CreateFolderRequestDto,
  CreateSessionRequestDto,
  CreateWorkspaceRequestDto,
  DeletedResourceResponseDto,
  DocumentConnectionsResponseDto,
  DocumentContentResponseDto,
  DocumentId,
  DocumentResponseDto,
  FolderResponseDto,
  ListArchivedDocumentsResponseDto,
  ListCheckpointsResponseDto,
  ListWorkspaceMembersResponseDto,
  ListWorkspacesResponseDto,
  MoveDocumentRequestDto,
  MoveFolderRequestDto,
  ProjectId,
  ProjectResponseDto,
  ReplaceDocumentPropertiesRequestDto,
  SeedReviewContextDto,
  SessionResponseDto,
  UpdateDocumentContentRequestDto,
  UpdateDocumentRequestDto,
  UpdateAccountProfileRequestDto,
  UpdateFolderRequestDto,
  UpdateProjectRequestDto,
  UpdateWorkspaceMemberRequestDto,
  UpdateWorkspaceRequestDto,
  UserResponseDto,
  WorkspaceId,
  WorkspaceMemberResponseDto,
  WorkspaceMembershipId,
  WorkspaceNavigationResponseDto,
  WorkspaceResponseDto,
} from "@rme/contracts";

export { createCollaborationCheckpoint, fetchCollaborationSession } from "./collaboration";
export {
  apiClientBoundaryId,
  apiClientMockReplacementPoint,
  createMockApiClient,
  createProductApiClient,
  fetchJson,
} from "./core";
export type { ApiClient } from "./core";
export {
  createMarkdownExport,
  inspectCheckpointSnapshot,
  uploadDocumentImage,
} from "./document-artifacts";
import { fetchJson, type ApiClient } from "./core";

export async function createAccount(
  client: ApiClient,
  request: CreateAccountRequestDto,
): Promise<UserResponseDto> {
  return fetchJson(client, "/accounts", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateAccountProfile(
  client: ApiClient,
  request: UpdateAccountProfileRequestDto,
): Promise<UserResponseDto> {
  return fetchJson(client, "/accounts/me/profile", {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function fetchAuthSession(client: ApiClient): Promise<SessionResponseDto> {
  return fetchJson(client, "/auth/session");
}

export async function createAuthSession(
  client: ApiClient,
  request: CreateSessionRequestDto,
): Promise<SessionResponseDto> {
  return fetchJson(client, "/auth/session", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function deleteAuthSession(client: ApiClient): Promise<void> {
  return fetchJson(client, "/auth/session", {
    method: "DELETE",
  });
}

export async function fetchWorkspaces(client: ApiClient): Promise<ListWorkspacesResponseDto> {
  return fetchJson(client, "/workspaces");
}

export async function createWorkspace(
  client: ApiClient,
  request: CreateWorkspaceRequestDto,
): Promise<WorkspaceResponseDto> {
  return fetchJson(client, "/workspaces", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateWorkspace(
  client: ApiClient,
  workspaceId: WorkspaceId,
  request: UpdateWorkspaceRequestDto,
): Promise<WorkspaceResponseDto> {
  return fetchJson(client, `/workspaces/${encodeURIComponent(workspaceId)}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function deleteWorkspace(
  client: ApiClient,
  workspaceId: WorkspaceId,
): Promise<DeletedResourceResponseDto> {
  return fetchJson(client, `/workspaces/${encodeURIComponent(workspaceId)}`, {
    method: "DELETE",
  });
}

export async function fetchWorkspaceMembers(
  client: ApiClient,
  workspaceId: WorkspaceId,
): Promise<ListWorkspaceMembersResponseDto> {
  return fetchJson(client, `/workspaces/${encodeURIComponent(workspaceId)}/members`);
}

export async function createWorkspaceMember(
  client: ApiClient,
  workspaceId: WorkspaceId,
  request: CreateWorkspaceMemberRequestDto,
): Promise<WorkspaceMemberResponseDto> {
  return fetchJson(client, `/workspaces/${encodeURIComponent(workspaceId)}/members`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateWorkspaceMember(
  client: ApiClient,
  workspaceId: WorkspaceId,
  memberId: WorkspaceMembershipId,
  request: UpdateWorkspaceMemberRequestDto,
): Promise<WorkspaceMemberResponseDto> {
  return fetchJson(
    client,
    `/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(memberId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(request),
    },
  );
}

export async function deleteWorkspaceMember(
  client: ApiClient,
  workspaceId: WorkspaceId,
  memberId: WorkspaceMembershipId,
): Promise<DeletedResourceResponseDto> {
  return fetchJson(
    client,
    `/workspaces/${encodeURIComponent(workspaceId)}/members/${encodeURIComponent(memberId)}`,
    {
      method: "DELETE",
    },
  );
}

export async function fetchWorkspaceNavigation(
  client: ApiClient,
  workspaceId: WorkspaceId,
): Promise<WorkspaceNavigationResponseDto> {
  return fetchJson(client, `/workspaces/${encodeURIComponent(workspaceId)}/navigation`);
}

export async function createProject(
  client: ApiClient,
  workspaceId: WorkspaceId,
  request: CreateProjectRequestDto,
): Promise<ProjectResponseDto> {
  return fetchJson(client, `/workspaces/${encodeURIComponent(workspaceId)}/projects`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateProject(
  client: ApiClient,
  projectId: ProjectId,
  request: UpdateProjectRequestDto,
): Promise<ProjectResponseDto> {
  return fetchJson(client, `/projects/${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function deleteProject(
  client: ApiClient,
  projectId: ProjectId,
): Promise<DeletedResourceResponseDto> {
  return fetchJson(client, `/projects/${encodeURIComponent(projectId)}`, {
    method: "DELETE",
  });
}

export async function fetchDocument(
  client: ApiClient,
  documentId: DocumentId,
): Promise<DocumentResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}`);
}

export async function updateDocument(
  client: ApiClient,
  documentId: DocumentId,
  request: UpdateDocumentRequestDto,
): Promise<DocumentResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function deleteDocument(
  client: ApiClient,
  documentId: DocumentId,
): Promise<DeletedResourceResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  });
}

export async function moveDocument(
  client: ApiClient,
  documentId: DocumentId,
  request: MoveDocumentRequestDto,
): Promise<DocumentResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}/move`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function fetchArchivedDocuments(
  client: ApiClient,
  workspaceId: WorkspaceId,
): Promise<ListArchivedDocumentsResponseDto> {
  return fetchJson(client, `/workspaces/${encodeURIComponent(workspaceId)}/trash/documents`);
}

export async function restoreDocument(
  client: ApiClient,
  documentId: DocumentId,
): Promise<DocumentResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}/restore`, {
    method: "POST",
  });
}

export async function replaceDocumentProperties(
  client: ApiClient,
  documentId: DocumentId,
  request: ReplaceDocumentPropertiesRequestDto,
): Promise<DocumentResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}/properties`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function fetchDocumentContent(
  client: ApiClient,
  documentId: DocumentId,
): Promise<DocumentContentResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}/content`);
}

export async function updateDocumentContent(
  client: ApiClient,
  documentId: DocumentId,
  request: UpdateDocumentContentRequestDto,
): Promise<DocumentContentResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}/content`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export async function createDocument(
  client: ApiClient,
  folderId: string,
  request: CreateDocumentRequestDto,
): Promise<DocumentResponseDto> {
  return fetchJson(client, `/folders/${encodeURIComponent(folderId)}/documents`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function createFolder(
  client: ApiClient,
  request: CreateFolderRequestDto,
): Promise<FolderResponseDto> {
  return fetchJson(client, "/folders", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function updateFolder(
  client: ApiClient,
  folderId: string,
  request: UpdateFolderRequestDto,
): Promise<FolderResponseDto> {
  return fetchJson(client, `/folders/${encodeURIComponent(folderId)}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export async function moveFolder(
  client: ApiClient,
  folderId: string,
  request: MoveFolderRequestDto,
): Promise<FolderResponseDto> {
  return fetchJson(client, `/folders/${encodeURIComponent(folderId)}/move`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function deleteFolder(
  client: ApiClient,
  folderId: string,
): Promise<DeletedResourceResponseDto> {
  return fetchJson(client, `/folders/${encodeURIComponent(folderId)}`, {
    method: "DELETE",
  });
}

export async function fetchDocumentConnections(
  client: ApiClient,
  documentId: DocumentId,
): Promise<DocumentConnectionsResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}/connections`);
}

export async function fetchDocumentCheckpoints(
  client: ApiClient,
  documentId: DocumentId,
): Promise<ListCheckpointsResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}/checkpoints`);
}

export async function fetchSeedReviewContext(client: ApiClient): Promise<SeedReviewContextDto> {
  const response = await fetch(`${client.baseUrl}/review-context/seed`);

  if (!response.ok) {
    throw new Error(`Seed review context request failed with ${response.status}`);
  }

  return (await response.json()) as SeedReviewContextDto;
}
