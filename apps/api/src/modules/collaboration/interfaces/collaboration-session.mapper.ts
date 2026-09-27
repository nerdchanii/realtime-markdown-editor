import type { RealtimeMemberDto } from "@rme/contracts";

import type {
  CollaborationSessionResponseDto,
  RuntimeCollaborationSessionResponseDto,
} from "@/modules/collaboration/interfaces/collaboration-session.dto.js";
import type {
  CollaborationMember,
  CollaborationSession,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import type { IssuedCollaborationSession } from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";

export function mapIssuedCollaborationSessionToResponseDto(
  issued: IssuedCollaborationSession,
): CollaborationSessionResponseDto {
  return {
    ...mapRuntimeCollaborationSessionToResponseDto(issued.session),
    connection: {
      token: issued.connection.token,
      expiresAt: issued.connection.expiresAt.toISOString(),
      access: issued.connection.access,
    },
  };
}

/** 협업 서버 내부 조회용이다. 연결 token 을 싣지 않는다. */
export function mapRuntimeCollaborationSessionToResponseDto(
  session: CollaborationSession,
): RuntimeCollaborationSessionResponseDto {
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
