import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import type { CreateCheckpointResponseDto } from "@rme/contracts";

import type { CollaborationSessionResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.dto.js";
import type { CollaborationMembershipId } from "@/modules/collaboration/ports/collaboration-session-repository.js";
import { mapCollaborationSessionToResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.mapper.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import type { CreateCheckpointRequestDto } from "@/modules/documents/interfaces/checkpoints.dto.js";
import { mapCheckpointToDto } from "@/modules/documents/interfaces/checkpoints.mapper.js";
import { CreateCheckpointUseCase } from "@/modules/documents/use-cases/create-checkpoint-use-case.js";
import { IssueSeedCollaborationSessionUseCase } from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";

@Controller("collaboration")
export class CollaborationSessionController {
  constructor(
    @Inject(IssueSeedCollaborationSessionUseCase)
    private readonly issueSeedCollaborationSession: IssueSeedCollaborationSessionUseCase,
    @Inject(CreateCheckpointUseCase)
    private readonly createCheckpoint: CreateCheckpointUseCase,
  ) {}

  @Get("sessions/seed")
  async getSeedSession(
    @Query("memberId") memberId?: string,
  ): Promise<CollaborationSessionResponseDto> {
    const session = await this.issueSeedCollaborationSession.execute({
      memberId: memberId ? (memberId as CollaborationMembershipId) : null,
    });
    if (!session) {
      throw new NotFoundException("Collaboration session not found for seeded member.");
    }

    return mapCollaborationSessionToResponseDto(session);
  }

  @Post("documents/:documentId/checkpoints")
  async captureCheckpoint(
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
}
