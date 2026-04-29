import type { DocumentId, DocumentSyncStateDto, RealtimeMemberDto } from "@rme/contracts";

export type CollaborationSessionResponseDto = Readonly<{
  documentId: DocumentId;
  documentKey: string;
  realtimeUrl: string;
  currentMember: RealtimeMemberDto;
  allowedMembers: readonly RealtimeMemberDto[];
  sync: DocumentSyncStateDto;
}>;
