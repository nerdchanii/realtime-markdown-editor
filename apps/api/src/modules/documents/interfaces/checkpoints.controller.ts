import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
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
  type ListCheckpointsResponse,
} from "@/modules/documents/interfaces/checkpoints.dto.js";
import {
  CheckpointCurrentContentNotFoundError,
  CreateCheckpointUseCase,
} from "@/modules/documents/use-cases/create-checkpoint-use-case.js";
import { InspectCheckpointSnapshotUseCase } from "@/modules/documents/use-cases/inspect-checkpoint-snapshot-use-case.js";
import { ListCheckpointsUseCase } from "@/modules/documents/use-cases/list-checkpoints-use-case.js";
import {
  AuthSessionService,
  currentMembershipId,
} from "@/modules/identity/use-cases/auth-session-service.js";

@Controller("documents")
export class CheckpointsController {
  constructor(
    @Inject(CreateCheckpointUseCase)
    private readonly createCheckpoint: CreateCheckpointUseCase,
    @Inject(InspectCheckpointSnapshotUseCase)
    private readonly inspectCheckpointSnapshot: InspectCheckpointSnapshotUseCase,
    @Inject(ListCheckpointsUseCase)
    private readonly listCheckpoints: ListCheckpointsUseCase,
    @Inject(AuthSessionService)
    private readonly authSessions: AuthSessionService,
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
    @Headers("cookie") cookieHeader?: string,
  ): Promise<CreateCheckpointResponseDto> {
    const authorMembershipId = await this.resolveAuthorMembershipId(cookieHeader);
    const snapshot = await this.createCheckpointFromCurrentContent(
      documentId as DocumentId,
      authorMembershipId,
      body.message,
    );

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

  private async createCheckpointFromCurrentContent(
    documentId: DocumentId,
    authorMembershipId: WorkspaceMembershipId,
    message: string,
  ) {
    try {
      return await this.createCheckpoint.execute({
        documentId,
        authorMembershipId,
        message,
        resolveCurrentContent: true,
      });
    } catch (error) {
      if (error instanceof CheckpointCurrentContentNotFoundError) {
        throw new NotFoundException("Current Markdown projection not found.");
      }

      throw error;
    }
  }

  private async resolveAuthorMembershipId(cookieHeader: string | undefined) {
    const session = await this.authSessions.resolveSession(cookieHeader);
    const membershipId = session ? currentMembershipId(session) : null;
    if (!membershipId) throw new UnauthorizedException("Authentication is required.");

    return membershipId as WorkspaceMembershipId;
  }
}
