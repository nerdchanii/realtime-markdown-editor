import { Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from "@nestjs/common";
import type {
  CreateFolderRequestDto,
  CreateProjectRequestDto,
  CreateWorkspaceRequestDto,
  DeletedResourceResponseDto,
  FolderId,
  FolderChildrenResponseDto,
  FolderResponseDto,
  ListProjectsResponseDto,
  ListWorkspacesResponseDto,
  MoveFolderRequestDto,
  ProjectId,
  ProjectResponseDto,
  UpdateFolderRequestDto,
  UpdateProjectRequestDto,
  WorkspaceId,
  UpdateWorkspaceRequestDto,
  WorkspaceNavigationResponseDto,
  WorkspaceResponseDto,
} from "@rme/contracts";

import {
  ProductApiAccessService,
  sessionWorkspaceIds,
} from "@/modules/identity/use-cases/product-api-access-service.js";
import { WorkspaceProductService } from "@/modules/workspace/use-cases/workspace-product-service.js";

@Controller()
export class WorkspaceProductController {
  constructor(
    @Inject(WorkspaceProductService)
    private readonly workspaces: WorkspaceProductService,
    @Inject(ProductApiAccessService)
    private readonly access: ProductApiAccessService,
  ) {}

  @Get("workspaces")
  async listWorkspaces(
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ListWorkspacesResponseDto> {
    const session = await this.access.requireSession(cookieHeader);
    return this.workspaces.listWorkspaces(sessionWorkspaceIds(session));
  }

  @Post("workspaces")
  async createWorkspace(
    @Body() body: CreateWorkspaceRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<WorkspaceResponseDto> {
    const session = await this.access.requireSession(cookieHeader);
    return {
      workspace: await this.workspaces.createWorkspace(body, {
        userId: session.user.id,
        displayName: session.user.name,
      }),
    };
  }

  @Get("workspaces/:workspaceId")
  async getWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<WorkspaceResponseDto> {
    await this.access.requireWorkspaceAccess(cookieHeader, workspaceId as WorkspaceId);
    return { workspace: await this.workspaces.getWorkspace(workspaceId) };
  }

  @Patch("workspaces/:workspaceId")
  async updateWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Body() body: UpdateWorkspaceRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<WorkspaceResponseDto> {
    await this.access.requireWorkspaceAccess(cookieHeader, workspaceId as WorkspaceId);
    return { workspace: await this.workspaces.updateWorkspace(workspaceId, body) };
  }

  @Get("workspaces/:workspaceId/navigation")
  async getWorkspaceNavigation(
    @Param("workspaceId") workspaceId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<WorkspaceNavigationResponseDto> {
    await this.access.requireWorkspaceAccess(cookieHeader, workspaceId as WorkspaceId);
    return this.workspaces.getWorkspaceNavigation(workspaceId);
  }

  @Get("workspaces/:workspaceId/projects")
  async listProjects(
    @Param("workspaceId") workspaceId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ListProjectsResponseDto> {
    await this.access.requireWorkspaceAccess(cookieHeader, workspaceId as WorkspaceId);
    return this.workspaces.listProjects(workspaceId);
  }

  @Post("workspaces/:workspaceId/projects")
  async createProject(
    @Param("workspaceId") workspaceId: string,
    @Body() body: CreateProjectRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ProjectResponseDto> {
    await this.access.requireWorkspaceAccess(cookieHeader, workspaceId as WorkspaceId);
    return { project: await this.workspaces.createProject(workspaceId, body) };
  }

  @Get("projects/:projectId")
  async getProject(
    @Param("projectId") projectId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ProjectResponseDto> {
    await this.access.requireProjectAccess(cookieHeader, projectId as ProjectId);
    return { project: await this.workspaces.getProject(projectId) };
  }

  @Patch("projects/:projectId")
  async updateProject(
    @Param("projectId") projectId: string,
    @Body() body: UpdateProjectRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<ProjectResponseDto> {
    await this.access.requireProjectAccess(cookieHeader, projectId as ProjectId);
    return { project: await this.workspaces.updateProject(projectId, body) };
  }

  @Get("folders/:folderId/children")
  async getFolderChildren(
    @Param("folderId") folderId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<FolderChildrenResponseDto> {
    await this.access.requireFolderAccess(cookieHeader, folderId as FolderId);
    return this.workspaces.getFolderChildren(folderId);
  }

  @Post("folders")
  async createFolder(
    @Body() body: CreateFolderRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<FolderResponseDto> {
    await this.access.requireFolderAccess(cookieHeader, body.parentFolderId);
    return { folder: await this.workspaces.createFolder(body) };
  }

  @Patch("folders/:folderId")
  async updateFolder(
    @Param("folderId") folderId: string,
    @Body() body: UpdateFolderRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<FolderResponseDto> {
    await this.access.requireFolderAccess(cookieHeader, folderId as FolderId);
    return { folder: await this.workspaces.updateFolder(folderId, body) };
  }

  @Post("folders/:folderId/move")
  async moveFolder(
    @Param("folderId") folderId: string,
    @Body() body: MoveFolderRequestDto,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<FolderResponseDto> {
    await this.access.requireFolderAccess(cookieHeader, folderId as FolderId);
    await this.access.requireFolderAccess(cookieHeader, body.targetParentFolderId);
    return { folder: await this.workspaces.moveFolder(folderId, body) };
  }

  @Delete("folders/:folderId")
  async deleteFolder(
    @Param("folderId") folderId: string,
    @Headers("cookie") cookieHeader: string | undefined,
  ): Promise<DeletedResourceResponseDto> {
    await this.access.requireFolderAccess(cookieHeader, folderId as FolderId);
    return this.workspaces.deleteFolder(folderId);
  }
}
