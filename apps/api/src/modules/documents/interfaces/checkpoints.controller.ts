import {
  Body,
  Controller,
  Get,
  Header,
  Inject,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";

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
} from "@/modules/documents/interfaces/checkpoints.dto.js";
import { CreateCheckpointUseCase } from "@/modules/documents/use-cases/create-checkpoint-use-case.js";
import { InspectCheckpointSnapshotUseCase } from "@/modules/documents/use-cases/inspect-checkpoint-snapshot-use-case.js";

@Controller("documents")
export class CheckpointsController {
  constructor(
    @Inject(CreateCheckpointUseCase)
    private readonly createCheckpoint: CreateCheckpointUseCase,
    @Inject(InspectCheckpointSnapshotUseCase)
    private readonly inspectCheckpointSnapshot: InspectCheckpointSnapshotUseCase,
  ) {}

  @Post(":documentId/checkpoints")
  @Header("Access-Control-Allow-Origin", "*")
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
  @Header("Access-Control-Allow-Origin", "*")
  async inspectSnapshot(
    @Param("checkpointId") checkpointId: string,
  ): Promise<InspectCheckpointSnapshotResponseDto> {
    const snapshot = await this.inspectCheckpointSnapshot.execute(checkpointId as CheckpointId);
    if (!snapshot) throw new NotFoundException("Checkpoint snapshot not found.");

    return mapCheckpointSnapshotToDto(snapshot);
  }
}
