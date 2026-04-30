import type {
  CollaborationSessionDto,
  CollaborationSessionResponseDto,
  CheckpointId,
  CheckpointSnapshotInspectDto,
  CreateCheckpointRequestDto,
  CreateCheckpointResponseDto,
  CreateMarkdownExportRequestDto,
  MarkdownExportResponseDto,
  SeedReviewContextDto,
  WorkspaceMembershipId,
} from "@rme/contracts";

export type ApiClient = Readonly<{
  baseUrl: string;
  providerName: string;
}>;

export const apiClientBoundaryId = "lib.api-client";
export const apiClientMockReplacementPoint = "lib.api-client.mock";

export function createMockApiClient(): ApiClient {
  return {
    baseUrl: "http://127.0.0.1:4000",
    providerName: apiClientMockReplacementPoint,
  };
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
  member: string | null,
): Promise<CollaborationSessionDto> {
  const params = new URLSearchParams();
  if (member) params.set("memberId", memberIdForRouteMember(member));

  const response = await fetch(
    `${client.baseUrl}/collaboration/documents/${encodeURIComponent(documentId)}/session?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Collaboration session request failed with ${response.status}`);
  }

  return mapCollaborationSessionResponse(
    (await response.json()) as CollaborationSessionResponseDto,
  );
}

export async function createCollaborationCheckpoint(
  client: ApiClient,
  documentId: string,
  request: CreateCheckpointRequestDto,
): Promise<CreateCheckpointResponseDto> {
  const body = new URLSearchParams({
    message: request.message,
  });
  const response = await fetch(
    `${client.baseUrl}/collaboration/documents/${encodeURIComponent(documentId)}/checkpoints`,
    {
      method: "POST",
      body,
    },
  );

  if (!response.ok) {
    throw new Error(`Checkpoint creation request failed with ${response.status}`);
  }

  return (await response.json()) as CreateCheckpointResponseDto;
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
      body,
    },
  );

  if (!response.ok) {
    throw new Error(`Markdown export request failed with ${response.status}`);
  }

  return (await response.json()) as MarkdownExportResponseDto;
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

function memberIdForRouteMember(member: string): WorkspaceMembershipId {
  if (member.startsWith("member_")) return member as WorkspaceMembershipId;
  return `member_${member}` as WorkspaceMembershipId;
}
