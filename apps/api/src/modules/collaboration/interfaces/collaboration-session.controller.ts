import { Controller, Get, Inject, NotFoundException, Query } from "@nestjs/common";

import type { CollaborationSessionResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.dto.js";
import type { CollaborationMembershipId } from "@/modules/collaboration/ports/collaboration-session-repository.js";
import { mapCollaborationSessionToResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.mapper.js";
import { IssueSeedCollaborationSessionUseCase } from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";

@Controller("collaboration")
export class CollaborationSessionController {
  constructor(
    @Inject(IssueSeedCollaborationSessionUseCase)
    private readonly issueSeedCollaborationSession: IssueSeedCollaborationSessionUseCase,
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
}
