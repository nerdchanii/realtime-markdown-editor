import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  CreateFolderRequestDto,
  CreateProjectRequestDto,
  CreateWorkspaceMemberRequestDto,
  CreateWorkspaceRequestDto,
  DeletedResourceResponseDto,
  FolderChildrenResponseDto,
  FolderDto,
  ListProjectsResponseDto,
  ListWorkspaceMembersResponseDto,
  ListWorkspacesResponseDto,
  MoveFolderRequestDto,
  ProjectDto,
  UpdateFolderRequestDto,
  UpdateProjectRequestDto,
  UpdateWorkspaceMemberRequestDto,
  UpdateWorkspaceRequestDto,
  WorkspaceMemberDto,
  WorkspaceMembershipId,
  WorkspaceDto,
  WorkspaceId,
  WorkspaceNavigationResponseDto,
} from "@rme/contracts";

import {
  WORKSPACE_PRODUCT_REPOSITORY,
  type WorkspaceOwnerCreateInput,
  type WorkspaceProductRepository,
} from "@/modules/workspace/ports/workspace-product-repository.js";

@Injectable()
export class WorkspaceProductService {
  constructor(
    @Inject(WORKSPACE_PRODUCT_REPOSITORY)
    private readonly repository: WorkspaceProductRepository,
  ) {}

  async listWorkspaces(workspaceIds?: readonly WorkspaceId[]): Promise<ListWorkspacesResponseDto> {
    return { workspaces: await this.repository.listWorkspaces(workspaceIds) };
  }

  async createWorkspace(
    input: CreateWorkspaceRequestDto,
    owner?: WorkspaceOwnerCreateInput,
  ): Promise<WorkspaceDto> {
    return this.repository.createWorkspace(input, owner);
  }

  async getWorkspace(workspaceId: string): Promise<WorkspaceDto> {
    return required(await this.repository.findWorkspace(workspaceId), "Workspace not found.");
  }

  async updateWorkspace(
    workspaceId: string,
    input: UpdateWorkspaceRequestDto,
  ): Promise<WorkspaceDto> {
    return required(
      await this.repository.updateWorkspace(workspaceId, input),
      "Workspace not found.",
    );
  }

  async listWorkspaceMembers(workspaceId: string): Promise<ListWorkspaceMembersResponseDto> {
    return required(
      await this.repository.listWorkspaceMembers(workspaceId),
      "Workspace not found.",
    );
  }

  async addWorkspaceMember(
    workspaceId: string,
    input: CreateWorkspaceMemberRequestDto,
  ): Promise<WorkspaceMemberDto> {
    assertSupportedRole(input.role);

    return required(
      await this.repository.addWorkspaceMember(workspaceId, input),
      "Workspace or user not found.",
    );
  }

  async updateWorkspaceMember(
    workspaceId: string,
    memberId: string,
    input: UpdateWorkspaceMemberRequestDto,
  ): Promise<WorkspaceMemberDto> {
    assertSupportedRole(input.role);
    const members = await this.listWorkspaceMembers(workspaceId);
    const member = members.members.find((candidate) => candidate.id === memberId);
    if (!member) throw new NotFoundException("Workspace member not found.");
    if (member.role === "owner" && input.role === "editor" && ownerCount(members.members) <= 1) {
      throw new BadRequestException("Workspace must keep at least one owner.");
    }

    return required(
      await this.repository.updateWorkspaceMember(workspaceId, memberId, input),
      "Workspace member not found.",
    );
  }

  async removeWorkspaceMember(
    workspaceId: string,
    memberId: string,
    actorMemberId: WorkspaceMembershipId,
  ): Promise<DeletedResourceResponseDto> {
    if (memberId === actorMemberId) {
      throw new ForbiddenException("Workspace owners cannot remove themselves.");
    }
    const members = await this.listWorkspaceMembers(workspaceId);
    const member = members.members.find((candidate) => candidate.id === memberId);
    if (!member) throw new NotFoundException("Workspace member not found.");
    if (member.role === "owner" && ownerCount(members.members) <= 1) {
      throw new BadRequestException("Workspace must keep at least one owner.");
    }

    return required(
      await this.repository.removeWorkspaceMember(workspaceId, memberId),
      "Workspace member not found.",
    );
  }

  async getWorkspaceNavigation(workspaceId: string): Promise<WorkspaceNavigationResponseDto> {
    return required(
      await this.repository.getWorkspaceNavigation(workspaceId),
      "Workspace not found.",
    );
  }

  async listProjects(workspaceId: string): Promise<ListProjectsResponseDto> {
    return {
      projects: required(await this.repository.listProjects(workspaceId), "Workspace not found."),
    };
  }

  async createProject(workspaceId: string, input: CreateProjectRequestDto): Promise<ProjectDto> {
    return required(
      await this.repository.createProject(workspaceId, input),
      "Workspace not found.",
    );
  }

  async getProject(projectId: string): Promise<ProjectDto> {
    return required(await this.repository.findProject(projectId), "Project not found.");
  }

  async updateProject(projectId: string, input: UpdateProjectRequestDto): Promise<ProjectDto> {
    return required(await this.repository.updateProject(projectId, input), "Project not found.");
  }

  async getFolderChildren(folderId: string): Promise<FolderChildrenResponseDto> {
    return required(await this.repository.getFolderChildren(folderId), "Folder not found.");
  }

  async createFolder(input: CreateFolderRequestDto): Promise<FolderDto> {
    return required(await this.repository.createFolder(input), "Parent folder not found.");
  }

  async updateFolder(folderId: string, input: UpdateFolderRequestDto): Promise<FolderDto> {
    const folder = await this.getFolder(folderId);
    assertMutableFolder(folder);

    return required(await this.repository.updateFolder(folderId, input), "Folder not found.");
  }

  async moveFolder(folderId: string, input: MoveFolderRequestDto): Promise<FolderDto> {
    const folder = await this.getFolder(folderId);
    const targetParent = await this.getFolder(input.targetParentFolderId);
    assertMutableFolder(folder);
    assertSameFolderScope(folder, targetParent);
    if (folder.id === targetParent.id) {
      throw new BadRequestException("Folder cannot be moved under itself.");
    }
    if (await this.repository.folderHasDescendant(folder.id, targetParent.id)) {
      throw new BadRequestException("Folder cannot be moved under its descendant.");
    }

    return required(
      await this.repository.moveFolder(folderId, input.targetParentFolderId),
      "Folder not found.",
    );
  }

  async deleteFolder(folderId: string): Promise<DeletedResourceResponseDto> {
    const folder = await this.getFolder(folderId);
    assertMutableFolder(folder);

    return required(await this.repository.deleteFolder(folderId), "Folder not found.");
  }

  private async getFolder(folderId: string): Promise<FolderDto> {
    return required(await this.repository.findFolder(folderId), "Folder not found.");
  }
}

function required<T>(value: T | null, message: string): T {
  if (value === null) throw new NotFoundException(message);
  return value;
}

function assertMutableFolder(folder: FolderDto): void {
  if (folder.kind === "workspaceRoot" || folder.kind === "projectRoot") {
    throw new BadRequestException("Root folders are immutable.");
  }
}

function assertSameFolderScope(folder: FolderDto, targetParent: FolderDto): void {
  if (
    folder.workspaceId !== targetParent.workspaceId ||
    folder.projectId !== targetParent.projectId
  ) {
    throw new BadRequestException("Folder move target must be in the same owner scope.");
  }
}

function assertSupportedRole(role: UpdateWorkspaceMemberRequestDto["role"]): void {
  if (role === "viewer") {
    throw new BadRequestException("Workspace member role must be owner or editor.");
  }
}

function ownerCount(members: readonly WorkspaceMemberDto[]): number {
  return members.filter((member) => member.role === "owner").length;
}
