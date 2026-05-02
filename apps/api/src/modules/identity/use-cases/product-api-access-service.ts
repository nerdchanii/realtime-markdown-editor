import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type {
  CheckpointId,
  DocumentId,
  FolderId,
  ProjectId,
  WorkspaceId,
  WorkspaceMemberDto,
} from "@rme/contracts";

import { PrismaDatabaseService } from "@/database/database.service.js";
import {
  AuthSessionService,
  type SessionContext,
} from "@/modules/identity/use-cases/auth-session-service.js";

export type ProductApiSessionAccess = Readonly<{
  session: SessionContext;
  membership: WorkspaceMemberDto;
}>;

@Injectable()
export class ProductApiAccessService {
  constructor(
    @Inject(AuthSessionService)
    private readonly authSessions: AuthSessionService,
    @Inject(PrismaDatabaseService)
    private readonly database: PrismaDatabaseService,
  ) {}

  async requireSession(cookieHeader: string | undefined): Promise<SessionContext> {
    const session = await this.authSessions.resolveSession(cookieHeader);
    if (!session) throw new UnauthorizedException("Authentication is required.");

    return session;
  }

  async requireWorkspaceAccess(
    cookieHeader: string | undefined,
    workspaceId: WorkspaceId,
  ): Promise<ProductApiSessionAccess> {
    const session = await this.requireSession(cookieHeader);
    return { session, membership: requireMembership(session, workspaceId) };
  }

  async requireWorkspaceOwnerAccess(
    cookieHeader: string | undefined,
    workspaceId: WorkspaceId,
  ): Promise<ProductApiSessionAccess> {
    const access = await this.requireWorkspaceAccess(cookieHeader, workspaceId);
    if (access.membership.role !== "owner") {
      throw new ForbiddenException("Workspace owner role is required.");
    }

    return access;
  }

  async requireProjectAccess(
    cookieHeader: string | undefined,
    projectId: ProjectId,
  ): Promise<ProductApiSessionAccess> {
    const project = await this.database.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });
    if (!project) throw new NotFoundException("Project not found.");

    return this.requireWorkspaceAccess(cookieHeader, project.workspaceId as WorkspaceId);
  }

  async requireFolderAccess(
    cookieHeader: string | undefined,
    folderId: FolderId,
  ): Promise<ProductApiSessionAccess> {
    const folder = await this.database.folder.findUnique({
      where: { id: folderId },
      select: { workspaceId: true, deletedAt: true },
    });
    if (!folder || folder.deletedAt) throw new NotFoundException("Folder not found.");

    return this.requireWorkspaceAccess(cookieHeader, folder.workspaceId as WorkspaceId);
  }

  async requireDocumentAccess(
    cookieHeader: string | undefined,
    documentId: DocumentId,
  ): Promise<ProductApiSessionAccess> {
    const workspaceId = await this.workspaceIdForDocument(documentId);
    return this.requireWorkspaceAccess(cookieHeader, workspaceId);
  }

  async requireCheckpointAccess(
    cookieHeader: string | undefined,
    checkpointId: CheckpointId,
  ): Promise<ProductApiSessionAccess> {
    const checkpoint = await this.database.checkpoint.findUnique({
      where: { id: checkpointId },
      select: { documentId: true },
    });
    if (!checkpoint) throw new NotFoundException("Checkpoint not found.");

    return this.requireDocumentAccess(cookieHeader, checkpoint.documentId as DocumentId);
  }

  async requireCurrentMembershipForDocument(
    cookieHeader: string | undefined,
    documentId: DocumentId,
  ): Promise<WorkspaceMemberDto> {
    const workspaceId = await this.workspaceIdForDocument(documentId);
    const session = await this.requireSession(cookieHeader);
    const membership = session.currentMembership;
    if (!membership) throw new ForbiddenException("Workspace membership is required.");
    if (membership.workspaceId !== workspaceId) {
      throw new ForbiddenException("Workspace membership is required.");
    }

    return membership;
  }

  private async workspaceIdForDocument(documentId: DocumentId): Promise<WorkspaceId> {
    const document = await this.database.document.findUnique({
      where: { id: documentId },
      select: { folder: { select: { workspaceId: true } } },
    });
    if (!document) throw new NotFoundException("Document not found.");

    return document.folder.workspaceId as WorkspaceId;
  }
}

function requireMembership(session: SessionContext, workspaceId: WorkspaceId): WorkspaceMemberDto {
  const membership = session.memberships.find((candidate) => candidate.workspaceId === workspaceId);
  if (!membership) throw new ForbiddenException("Workspace membership is required.");

  return membership;
}

export function sessionWorkspaceIds(session: SessionContext): readonly WorkspaceId[] {
  return session.memberships.map((membership) => membership.workspaceId);
}
