import type {
  CollaborationSessionDto,
  CollaborationSessionResponseDto,
  CreateCheckpointRequestDto,
  CreateCheckpointResponseDto,
} from "@rme/contracts";

import { fetchJson, type ApiClient } from "./core";

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
