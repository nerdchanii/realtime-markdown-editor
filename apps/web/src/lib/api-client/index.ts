import type {
  CollaborationSessionDto,
  CollaborationSessionResponseDto,
  CheckpointId,
  CheckpointSnapshotInspectDto,
  CreateDocumentRequestDto,
  CreateCheckpointRequestDto,
  CreateCheckpointResponseDto,
  CreateMarkdownExportRequestDto,
  CreateSessionRequestDto,
  DocumentConnectionsResponseDto,
  DocumentContentResponseDto,
  DocumentId,
  DocumentResponseDto,
  ImageUploadResponseDto,
  ListCheckpointsResponseDto,
  ListWorkspacesResponseDto,
  MarkdownExportResponseDto,
  SeedReviewContextDto,
  SessionResponseDto,
  UpdateDocumentContentRequestDto,
  UploadedDocumentImageDto,
  WorkspaceId,
  WorkspaceNavigationResponseDto,
} from "@rme/contracts";

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

export async function fetchWorkspaces(client: ApiClient): Promise<ListWorkspacesResponseDto> {
  return fetchJson(client, "/workspaces");
}

export async function fetchWorkspaceNavigation(
  client: ApiClient,
  workspaceId: WorkspaceId,
): Promise<WorkspaceNavigationResponseDto> {
  return fetchJson(client, `/workspaces/${encodeURIComponent(workspaceId)}/navigation`);
}

export async function fetchDocument(
  client: ApiClient,
  documentId: DocumentId,
): Promise<DocumentResponseDto> {
  return fetchJson(client, `/documents/${encodeURIComponent(documentId)}`);
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
  return (
    import.meta.env.VITE_RME_API_BASE_URL ??
    import.meta.env.VITE_API_BASE_URL ??
    "http://127.0.0.1:4000"
  );
}

export async function inspectCheckpointSnapshot(
  client: ApiClient,
  checkpointId: CheckpointId,
): Promise<CheckpointSnapshotInspectDto> {
  const response = await fetch(
    `${client.baseUrl}/documents/checkpoints/${encodeURIComponent(checkpointId)}/snapshot`,
  );

  if (!response.ok) {
    throw new Error(`Checkpoint inspect request failed with ${response.status}`);
  }

  return (await response.json()) as CheckpointSnapshotInspectDto;
}

export async function createMarkdownExport(
  client: ApiClient,
  documentId: string,
  request: CreateMarkdownExportRequestDto,
): Promise<MarkdownExportResponseDto> {
  const body = new URLSearchParams();
  if (request.filename !== undefined) body.set("filename", request.filename);

  const response = await fetch(
    `${client.baseUrl}/documents/${encodeURIComponent(documentId)}/export`,
    {
      method: "POST",
      credentials: "include",
      body,
    },
  );

  if (!response.ok) {
    throw new Error(`Markdown export request failed with ${response.status}`);
  }

  return (await response.json()) as MarkdownExportResponseDto;
}

export async function uploadDocumentImage(
  client: ApiClient,
  documentId: string,
  request: Readonly<{ file: File; altText?: string | undefined }>,
): Promise<UploadedDocumentImageDto> {
  const body = new FormData();
  body.set("file", request.file);
  if (request.altText !== undefined) body.set("altText", request.altText);

  const response = await fetch(
    `${client.baseUrl}/documents/${encodeURIComponent(documentId)}/images`,
    {
      method: "POST",
      credentials: "include",
      body,
    },
  );

  if (!response.ok) {
    throw new Error(`Image upload request failed with ${response.status}`);
  }

  const payload = (await response.json()) as ImageUploadResponseDto;
  return payload.image;
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
