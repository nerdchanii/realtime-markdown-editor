import type {
  CreateFolderRequestDto,
  CreateProjectRequestDto,
  CreateWorkspaceRequestDto,
  DeletedResourceResponseDto,
  FolderChildrenResponseDto,
  FolderDto,
  ProjectDto,
  UpdateFolderRequestDto,
  UpdateProjectRequestDto,
  UpdateWorkspaceRequestDto,
  WorkspaceDto,
  WorkspaceNavigationResponseDto,
} from "@rme/contracts";

export const WORKSPACE_PRODUCT_REPOSITORY = Symbol("WORKSPACE_PRODUCT_REPOSITORY");

export interface WorkspaceProductRepository {
  listWorkspaces(): Promise<readonly WorkspaceDto[]>;
  createWorkspace(input: CreateWorkspaceRequestDto): Promise<WorkspaceDto>;
  findWorkspace(workspaceId: string): Promise<WorkspaceDto | null>;
  updateWorkspace(
    workspaceId: string,
    input: UpdateWorkspaceRequestDto,
  ): Promise<WorkspaceDto | null>;
  getWorkspaceNavigation(workspaceId: string): Promise<WorkspaceNavigationResponseDto | null>;
  listProjects(workspaceId: string): Promise<readonly ProjectDto[] | null>;
  createProject(workspaceId: string, input: CreateProjectRequestDto): Promise<ProjectDto | null>;
  findProject(projectId: string): Promise<ProjectDto | null>;
  updateProject(projectId: string, input: UpdateProjectRequestDto): Promise<ProjectDto | null>;
  getFolderChildren(folderId: string): Promise<FolderChildrenResponseDto | null>;
  createFolder(input: CreateFolderRequestDto): Promise<FolderDto | null>;
  findFolder(folderId: string): Promise<FolderDto | null>;
  updateFolder(folderId: string, input: UpdateFolderRequestDto): Promise<FolderDto | null>;
  moveFolder(folderId: string, targetParentFolderId: string): Promise<FolderDto | null>;
  folderHasDescendant(folderId: string, possibleDescendantId: string): Promise<boolean>;
  deleteFolder(folderId: string): Promise<DeletedResourceResponseDto | null>;
}
