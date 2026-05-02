import type {
  CollaborationSessionDto,
  CollaborationSessionResponseDto,
  CreateAccountRequestDto,
  CreateProjectRequestDto,
  CreateDocumentRequestDto,
  CreateFolderRequestDto,
  CreateCheckpointRequestDto,
  CreateCheckpointResponseDto,
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
  ListWorkspacesResponseDto,
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
  UpdateWorkspaceRequestDto,
  UserResponseDto,
  WorkspaceId,
  WorkspaceNavigationResponseDto,
  WorkspaceResponseDto,
} from "@rme/contracts";

export {
  createMarkdownExport,
  inspectCheckpointSnapshot,
  uploadDocumentImage,
} from "./document-artifacts";

export type ApiClient = Readonly<{
  baseUrl: string;
  providerName: string;
}>;

export const apiClientBoundaryId = "lib.api-client";
export const apiClientMockReplacementPoint = "lib.api-client.mock";

export function createMockApiClient(): ApiClient {
  return {
    baseUrl: apiBaseUrl(),
    providerName: apiClientMockReplacementPoint,
  };
}

export function createProductApiClient(): ApiClient {
  return {
    baseUrl: apiBaseUrl(),
    providerName: "lib.api-client.product",
  };
}

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

export async function fetchCollaborationSession(
  client: ApiClient,
  documentId: string,
): Promise<CollaborationSessionDto> {
  return mapCollaborationSessionResponse(
    await fetchJson<CollaborationSessionResponseDto>(
      client,
      `/documents/${encodeURIComponent(documentId)}/collaboration-sessions`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    ),
  );
}

export async function createCollaborationCheckpoint(
  client: ApiClient,
  documentId: string,
  request: CreateCheckpointRequestDto,
): Promise<CreateCheckpointResponseDto> {
  const response = await fetch(
    `${client.baseUrl}/documents/${encodeURIComponent(documentId)}/checkpoints`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error(`Checkpoint creation request failed with ${response.status}`);
  }

  return (await response.json()) as CreateCheckpointResponseDto;
}

async function fetchJson<T>(client: ApiClient, path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${client.baseUrl}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function apiBaseUrl() {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const configured = env?.VITE_RME_API_BASE_URL ?? env?.VITE_API_BASE_URL;
  if (configured) return configured;

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }

  return "http://127.0.0.1:4000";
}

function mapCollaborationSessionResponse(
  response: CollaborationSessionResponseDto,
): CollaborationSessionDto {
  return {
    documentId: response.documentId,
    documentKey: response.documentKey,
    realtimeUrl: response.realtimeUrl,
    currentMemberId: response.currentMember.id,
    members: response.allowedMembers,
    sync: response.sync,
  };
}
