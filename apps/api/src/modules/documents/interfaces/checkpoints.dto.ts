import type {
  CheckpointDto,
  CheckpointSnapshotInspectDto,
  ListCheckpointsResponseDto,
} from "@rme/contracts";

export type CreateCheckpointRequestDto = Readonly<{
  message: string;
}>;

export type CreateCheckpointResponseDto = Readonly<{
  checkpoint: CheckpointDto;
}>;

export type ListCheckpointsResponse = ListCheckpointsResponseDto;

export type InspectCheckpointSnapshotResponseDto = CheckpointSnapshotInspectDto;
