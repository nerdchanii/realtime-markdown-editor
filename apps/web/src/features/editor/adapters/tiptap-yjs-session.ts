import type { CollaborationSessionDto, RealtimeMemberDto } from "@rme/contracts";

export function isSameCollaborationRuntimeSession(
  current: CollaborationSessionDto,
  next: CollaborationSessionDto,
): boolean {
  return (
    current.documentId === next.documentId &&
    current.documentKey === next.documentKey &&
    current.realtimeUrl === next.realtimeUrl &&
    current.currentMemberId === next.currentMemberId &&
    isSameRealtimeMember(findCurrentMember(current), findCurrentMember(next))
  );
}

function isSameRealtimeMember(left: RealtimeMemberDto, right: RealtimeMemberDto) {
  return (
    left.id === right.id &&
    left.userId === right.userId &&
    left.workspaceId === right.workspaceId &&
    left.displayName === right.displayName &&
    left.color === right.color
  );
}

function findCurrentMember(session: CollaborationSessionDto): RealtimeMemberDto {
  const member = session.members.find((candidate) => candidate.id === session.currentMemberId);

  if (!member) {
    throw new Error("Collaboration session must include the current member");
  }

  return member;
}
