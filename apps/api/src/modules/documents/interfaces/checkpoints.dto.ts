import type {
  CheckpointDto,
  CheckpointSnapshotInspectDto,
  DocumentId,
  WorkspaceMembershipId,
} from "@rme/contracts";

export type CreateCheckpointRequestDto = Readonly<{
  documentId: DocumentId;
  authorMembershipId: WorkspaceMembershipId;
  message: string;
  markdownSnapshot: string;
}>;

export type CreateCheckpointResponseDto = Readonly<{
  checkpoint: CheckpointDto;
}>;

export type InspectCheckpointSnapshotResponseDto = CheckpointSnapshotInspectDto;
