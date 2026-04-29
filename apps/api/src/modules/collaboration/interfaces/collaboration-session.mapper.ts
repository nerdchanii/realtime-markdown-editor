import type { RealtimeMemberDto } from "@rme/contracts";

import type { CollaborationSessionResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.dto.js";
import type {
  CollaborationMember,
  CollaborationSession,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";

export function mapCollaborationSessionToResponseDto(
  session: CollaborationSession,
): CollaborationSessionResponseDto {
  return {
    documentId: session.documentId,
    documentKey: session.documentKey,
    realtimeUrl: session.realtimeUrl,
    currentMember: mapCollaborationMemberToDto(session.currentMember),
    allowedMembers: session.allowedMembers.map(mapCollaborationMemberToDto),
    sync: {
      status: session.sync.status,
      pendingLocalEdits: session.sync.pendingLocalEdits,
      lastSyncedAt: session.sync.lastSyncedAt?.toISOString() ?? null,
    },
  };
}

function mapCollaborationMemberToDto(member: CollaborationMember): RealtimeMemberDto {
  return {
    id: member.id,
    userId: member.userId,
    workspaceId: member.workspaceId,
    displayName: member.displayName,
    color: member.color,
  };
}
