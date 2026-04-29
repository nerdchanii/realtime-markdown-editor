import { Controller, Get, Header, Inject, NotFoundException, Param, Query } from "@nestjs/common";

import type { CollaborationSessionResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.dto.js";
import {
  type CollaborationDocumentId,
  type CollaborationMembershipId,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import { mapCollaborationSessionToResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.mapper.js";
import {
  IssueCollaborationSessionUseCase,
  IssueSeedCollaborationSessionUseCase,
} from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";

@Controller("collaboration")
export class CollaborationSessionController {
  constructor(
    @Inject(IssueCollaborationSessionUseCase)
    private readonly issueCollaborationSession: IssueCollaborationSessionUseCase,
    @Inject(IssueSeedCollaborationSessionUseCase)
    private readonly issueSeedCollaborationSession: IssueSeedCollaborationSessionUseCase,
  ) {}

  @Get("sessions/seed")
  @Header("Access-Control-Allow-Origin", "*")
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

  @Get("documents/:documentId/session")
  @Header("Access-Control-Allow-Origin", "*")
  async getDocumentSession(
    @Param("documentId") documentId: string,
    @Query("memberId") memberId?: string,
  ): Promise<CollaborationSessionResponseDto> {
    const session = await this.issueCollaborationSession.execute({
      documentId: documentId as CollaborationDocumentId,
      memberId: memberId ? (memberId as CollaborationMembershipId) : null,
    });

    if (!session) {
      throw new NotFoundException("Collaboration session not found for document and member.");
    }

    return mapCollaborationSessionToResponseDto(session);
  }
}
