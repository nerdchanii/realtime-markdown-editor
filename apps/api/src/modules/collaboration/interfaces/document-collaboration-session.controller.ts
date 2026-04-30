import {
  Controller,
  ForbiddenException,
  Headers,
  Inject,
  Param,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import type { CollaborationSessionResponseDto } from "@rme/contracts";

import { mapCollaborationSessionToResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.mapper.js";
import type {
  CollaborationDocumentId,
  CollaborationMembershipId,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import { IssueCollaborationSessionUseCase } from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";
import {
  AuthSessionService,
  currentMembershipId,
} from "@/modules/identity/use-cases/auth-session-service.js";

@Controller("documents")
export class DocumentCollaborationSessionController {
  constructor(
    @Inject(IssueCollaborationSessionUseCase)
    private readonly issueCollaborationSession: IssueCollaborationSessionUseCase,
    @Inject(AuthSessionService)
    private readonly authSessions: AuthSessionService,
  ) {}

  @Post(":documentId/collaboration-sessions")
  async createDocumentCollaborationSession(
    @Param("documentId") documentId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<CollaborationSessionResponseDto> {
    const authSession = await this.authSessions.resolveSession(cookieHeader);
    if (!authSession) throw new UnauthorizedException("Authentication is required.");

    const membershipId = currentMembershipId(authSession);
    if (!membershipId) throw new ForbiddenException("Workspace membership is required.");

    const session = await this.issueCollaborationSession.execute({
      documentId: documentId as CollaborationDocumentId,
      currentMembershipId: membershipId as CollaborationMembershipId,
    });
    if (!session) throw new ForbiddenException("Workspace membership is required.");

    return mapCollaborationSessionToResponseDto(session);
  }
}
