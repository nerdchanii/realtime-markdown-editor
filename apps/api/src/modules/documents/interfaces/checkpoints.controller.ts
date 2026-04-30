import { Body, Controller, Get, Inject, NotFoundException, Param, Post } from "@nestjs/common";

import type { CheckpointId } from "@/modules/documents/domain/checkpoint.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import {
  mapCheckpointSnapshotToDto,
  mapCheckpointToDto,
} from "@/modules/documents/interfaces/checkpoints.mapper.js";
import {
  type CreateCheckpointRequestDto,
  type CreateCheckpointResponseDto,
  type InspectCheckpointSnapshotResponseDto,
  type ListCheckpointsResponse,
} from "@/modules/documents/interfaces/checkpoints.dto.js";
import { CreateCheckpointUseCase } from "@/modules/documents/use-cases/create-checkpoint-use-case.js";
import { InspectCheckpointSnapshotUseCase } from "@/modules/documents/use-cases/inspect-checkpoint-snapshot-use-case.js";
import { ListCheckpointsUseCase } from "@/modules/documents/use-cases/list-checkpoints-use-case.js";

@Controller("documents")
export class CheckpointsController {
  constructor(
    @Inject(CreateCheckpointUseCase)
    private readonly createCheckpoint: CreateCheckpointUseCase,
    @Inject(InspectCheckpointSnapshotUseCase)
    private readonly inspectCheckpointSnapshot: InspectCheckpointSnapshotUseCase,
    @Inject(ListCheckpointsUseCase)
    private readonly listCheckpoints: ListCheckpointsUseCase,
  ) {}

  @Get(":documentId/checkpoints")
  async listDocumentCheckpoints(
    @Param("documentId") documentId: string,
  ): Promise<ListCheckpointsResponse> {
    const snapshots = await this.listCheckpoints.execute(documentId as DocumentId);

    return {
      checkpoints: snapshots.map((snapshot) =>
        mapCheckpointToDto(snapshot.checkpoint, snapshot.markdownBody),
      ),
    };
  }

  @Post(":documentId/checkpoints")
  async createDocumentCheckpoint(
    @Param("documentId") documentId: string,
    @Body() body: CreateCheckpointRequestDto,
  ): Promise<CreateCheckpointResponseDto> {
    const snapshot = await this.createCheckpoint.execute({
      documentId: documentId as DocumentId,
      authorMembershipId: body.authorMembershipId as WorkspaceMembershipId,
      message: body.message,
      markdownSnapshot: body.markdownSnapshot,
    });

    return {
      checkpoint: mapCheckpointToDto(snapshot.checkpoint, snapshot.markdownBody),
    };
  }

  @Get("checkpoints/:checkpointId/snapshot")
  async inspectSnapshot(
    @Param("checkpointId") checkpointId: string,
  ): Promise<InspectCheckpointSnapshotResponseDto> {
    const snapshot = await this.inspectCheckpointSnapshot.execute(checkpointId as CheckpointId);
    if (!snapshot) throw new NotFoundException("Checkpoint snapshot not found.");

    return mapCheckpointSnapshotToDto(snapshot);
  }
}
