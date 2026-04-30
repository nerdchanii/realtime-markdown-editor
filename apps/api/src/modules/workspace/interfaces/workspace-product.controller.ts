import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from "@nestjs/common";
import type {
  CreateFolderRequestDto,
  CreateProjectRequestDto,
  CreateWorkspaceRequestDto,
  DeletedResourceResponseDto,
  FolderChildrenResponseDto,
  FolderResponseDto,
  ListProjectsResponseDto,
  ListWorkspacesResponseDto,
  MoveFolderRequestDto,
  ProjectResponseDto,
  UpdateFolderRequestDto,
  UpdateProjectRequestDto,
  UpdateWorkspaceRequestDto,
  WorkspaceNavigationResponseDto,
  WorkspaceResponseDto,
} from "@rme/contracts";

import { WorkspaceProductService } from "@/modules/workspace/use-cases/workspace-product-service.js";

@Controller()
export class WorkspaceProductController {
  constructor(
    @Inject(WorkspaceProductService)
    private readonly workspaces: WorkspaceProductService,
  ) {}

  @Get("workspaces")
  listWorkspaces(): Promise<ListWorkspacesResponseDto> {
    return this.workspaces.listWorkspaces();
  }

  @Post("workspaces")
  async createWorkspace(@Body() body: CreateWorkspaceRequestDto): Promise<WorkspaceResponseDto> {
    return { workspace: await this.workspaces.createWorkspace(body) };
  }

  @Get("workspaces/:workspaceId")
  async getWorkspace(@Param("workspaceId") workspaceId: string): Promise<WorkspaceResponseDto> {
    return { workspace: await this.workspaces.getWorkspace(workspaceId) };
  }

  @Patch("workspaces/:workspaceId")
  async updateWorkspace(
    @Param("workspaceId") workspaceId: string,
    @Body() body: UpdateWorkspaceRequestDto,
  ): Promise<WorkspaceResponseDto> {
    return { workspace: await this.workspaces.updateWorkspace(workspaceId, body) };
  }

  @Get("workspaces/:workspaceId/navigation")
  getWorkspaceNavigation(
    @Param("workspaceId") workspaceId: string,
  ): Promise<WorkspaceNavigationResponseDto> {
    return this.workspaces.getWorkspaceNavigation(workspaceId);
  }

  @Get("workspaces/:workspaceId/projects")
  listProjects(@Param("workspaceId") workspaceId: string): Promise<ListProjectsResponseDto> {
    return this.workspaces.listProjects(workspaceId);
  }

  @Post("workspaces/:workspaceId/projects")
  async createProject(
    @Param("workspaceId") workspaceId: string,
    @Body() body: CreateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    return { project: await this.workspaces.createProject(workspaceId, body) };
  }

  @Get("projects/:projectId")
  async getProject(@Param("projectId") projectId: string): Promise<ProjectResponseDto> {
    return { project: await this.workspaces.getProject(projectId) };
  }

  @Patch("projects/:projectId")
  async updateProject(
    @Param("projectId") projectId: string,
    @Body() body: UpdateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    return { project: await this.workspaces.updateProject(projectId, body) };
  }

  @Get("folders/:folderId/children")
  getFolderChildren(@Param("folderId") folderId: string): Promise<FolderChildrenResponseDto> {
    return this.workspaces.getFolderChildren(folderId);
  }

  @Post("folders")
  async createFolder(@Body() body: CreateFolderRequestDto): Promise<FolderResponseDto> {
    return { folder: await this.workspaces.createFolder(body) };
  }

  @Patch("folders/:folderId")
  async updateFolder(
    @Param("folderId") folderId: string,
    @Body() body: UpdateFolderRequestDto,
  ): Promise<FolderResponseDto> {
    return { folder: await this.workspaces.updateFolder(folderId, body) };
  }

  @Post("folders/:folderId/move")
  async moveFolder(
    @Param("folderId") folderId: string,
    @Body() body: MoveFolderRequestDto,
  ): Promise<FolderResponseDto> {
    return { folder: await this.workspaces.moveFolder(folderId, body) };
  }

  @Delete("folders/:folderId")
  deleteFolder(@Param("folderId") folderId: string): Promise<DeletedResourceResponseDto> {
    return this.workspaces.deleteFolder(folderId);
  }
}
