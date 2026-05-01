import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CreateFolderRequestDto,
  CreateProjectRequestDto,
  CreateWorkspaceRequestDto,
  DeletedResourceResponseDto,
  FolderChildrenResponseDto,
  FolderDto,
  ListProjectsResponseDto,
  ListWorkspacesResponseDto,
  MoveFolderRequestDto,
  ProjectDto,
  UpdateFolderRequestDto,
  UpdateProjectRequestDto,
  UpdateWorkspaceRequestDto,
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
    const children = await this.getFolderChildren(folderId);
    if (children.folders.length > 0 || children.documents.length > 0) {
      throw new BadRequestException("Folder must be empty before it can be deleted.");
    }

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
