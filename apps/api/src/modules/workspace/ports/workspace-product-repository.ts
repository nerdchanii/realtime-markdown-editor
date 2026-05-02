import type {
  CreateFolderRequestDto,
  CreateProjectRequestDto,
  CreateWorkspaceMemberRequestDto,
  CreateWorkspaceRequestDto,
  DeletedResourceResponseDto,
  FolderChildrenResponseDto,
  FolderDto,
  ListWorkspaceMembersResponseDto,
  ProjectDto,
  UpdateFolderRequestDto,
  UpdateProjectRequestDto,
  UpdateWorkspaceMemberRequestDto,
  UpdateWorkspaceRequestDto,
  WorkspaceMemberDto,
  WorkspaceDto,
  WorkspaceNavigationResponseDto,
} from "@rme/contracts";
import type { UserId, WorkspaceId } from "@rme/contracts";

export const WORKSPACE_PRODUCT_REPOSITORY = Symbol("WORKSPACE_PRODUCT_REPOSITORY");

export type WorkspaceOwnerCreateInput = Readonly<{
  userId: UserId;
  displayName: string;
}>;

export interface WorkspaceProductRepository {
  listWorkspaces(workspaceIds?: readonly WorkspaceId[]): Promise<readonly WorkspaceDto[]>;
  createWorkspace(
    input: CreateWorkspaceRequestDto,
    owner?: WorkspaceOwnerCreateInput,
  ): Promise<WorkspaceDto>;
  findWorkspace(workspaceId: string): Promise<WorkspaceDto | null>;
  updateWorkspace(
    workspaceId: string,
    input: UpdateWorkspaceRequestDto,
  ): Promise<WorkspaceDto | null>;
  listWorkspaceMembers(workspaceId: string): Promise<ListWorkspaceMembersResponseDto | null>;
  addWorkspaceMember(
    workspaceId: string,
    input: CreateWorkspaceMemberRequestDto,
  ): Promise<WorkspaceMemberDto | null>;
  updateWorkspaceMember(
    workspaceId: string,
    memberId: string,
    input: UpdateWorkspaceMemberRequestDto,
  ): Promise<WorkspaceMemberDto | null>;
  removeWorkspaceMember(
    workspaceId: string,
    memberId: string,
  ): Promise<DeletedResourceResponseDto | null>;
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
