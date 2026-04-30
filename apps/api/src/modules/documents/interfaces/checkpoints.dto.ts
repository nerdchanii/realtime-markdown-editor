import type {
  CheckpointDto,
  CheckpointSnapshotInspectDto,
  DocumentId,
  ListCheckpointsResponseDto,
  WorkspaceMembershipId,
} from "@rme/contracts";

export type CreateCheckpointRequestDto = Readonly<{
  message: string;
  documentId?: DocumentId | undefined;
  authorMembershipId?: WorkspaceMembershipId | undefined;
  markdownSnapshot?: string | undefined;
}>;

export type CreateCheckpointResponseDto = Readonly<{
  checkpoint: CheckpointDto;
}>;

export type ListCheckpointsResponse = ListCheckpointsResponseDto;

export type InspectCheckpointSnapshotResponseDto = CheckpointSnapshotInspectDto;
