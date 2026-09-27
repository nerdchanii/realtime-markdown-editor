import { Controller, ForbiddenException, Headers, Inject, Param, Post } from "@nestjs/common";
import type { DocumentId } from "@rme/contracts";

import type { CollaborationSessionResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.dto.js";
import { mapIssuedCollaborationSessionToResponseDto } from "@/modules/collaboration/interfaces/collaboration-session.mapper.js";
import type {
  CollaborationDocumentId,
  CollaborationMembershipId,
  CollaborationUserId,
  CollaborationWorkspaceId,
} from "@/modules/collaboration/ports/collaboration-session-repository.js";
import { IssueCollaborationSessionUseCase } from "@/modules/collaboration/use-cases/issue-collaboration-session-use-case.js";
import { ProductApiAccessService } from "@/modules/identity/use-cases/product-api-access-service.js";

@Controller("documents")
export class DocumentCollaborationSessionController {
  constructor(
    @Inject(IssueCollaborationSessionUseCase)
    private readonly issueCollaborationSession: IssueCollaborationSessionUseCase,
    @Inject(ProductApiAccessService)
    private readonly access: ProductApiAccessService,
  ) {}

  @Post(":documentId/collaboration-sessions")
  async createDocumentCollaborationSession(
    @Param("documentId") documentId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<CollaborationSessionResponseDto> {
    // 문서가 속한 workspace 의 멤버십을 세션에서 고른다. 다른 workspace 의 멤버십이나
    // 암묵적인 첫 번째 멤버십은 쓰지 않는다.
    const { membership } = await this.access.requireDocumentAccess(
      cookieHeader,
      documentId as DocumentId,
    );

    const issued = await this.issueCollaborationSession.execute({
      documentId: documentId as CollaborationDocumentId,
      membership: {
        id: membership.id as string as CollaborationMembershipId,
        userId: membership.userId as string as CollaborationUserId,
        workspaceId: membership.workspaceId as string as CollaborationWorkspaceId,
        role: membership.role,
      },
    });
    if (!issued) throw new ForbiddenException("Document collaboration access is not permitted.");

    return mapIssuedCollaborationSessionToResponseDto(issued);
  }
}
