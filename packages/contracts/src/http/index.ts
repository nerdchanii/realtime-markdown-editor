/* eslint-disable max-lines */

import type {
  CheckpointId,
  DocumentId,
  FolderId,
  ProjectId,
  PublicationId,
  RevisionId,
  UserId,
  WorkspaceId,
  WorkspaceMembershipId,
} from "../ids.js";
import type {
  CollaborationSessionDto,
  DocumentSyncStateDto,
  IssuedCollaborationSessionDto,
} from "../realtime/index.js";

export type WorkspaceMemberRoleDto = "owner" | "editor" | "viewer";

export type UserDto = Readonly<{
  id: UserId;
  email: string;
  name: string;
}>;

export type CreateAccountRequestDto = Readonly<{
  email: string;
  name: string;
  password: string;
}>;

export type UserResponseDto = Readonly<{
  user: UserDto;
}>;

export type UpdateAccountProfileRequestDto = Readonly<{
  name?: string;
}>;

export type WorkspaceMemberDto = Readonly<{
  id: WorkspaceMembershipId;
  userId: UserId;
  workspaceId: WorkspaceId;
  displayName: string;
  color: string;
  role: WorkspaceMemberRoleDto;
}>;

export type SessionDto = Readonly<{
  user: UserDto;
  memberships: readonly WorkspaceMemberDto[];
  currentMembership: WorkspaceMemberDto | null;
}>;

export type CreateSessionRequestDto = Readonly<{
  email: string;
  password: string;
  workspaceId?: WorkspaceId;
}>;

export type SessionResponseDto = Readonly<{
  session: SessionDto;
}>;

export type EmptyResponseDto = Readonly<Record<string, never>>;

export type WorkspaceDto = Readonly<{
  id: WorkspaceId;
  name: string;
  rootFolderId: FolderId;
}>;

export type CreateWorkspaceRequestDto = Readonly<{
  name: string;
}>;

export type UpdateWorkspaceRequestDto = Readonly<{
  name?: string;
}>;

export type WorkspaceResponseDto = Readonly<{
  workspace: WorkspaceDto;
}>;

export type ListWorkspacesResponseDto = Readonly<{
  workspaces: readonly WorkspaceDto[];
}>;

export type ProjectDto = Readonly<{
  id: ProjectId;
  workspaceId: WorkspaceId;
  name: string;
  rootFolderId: FolderId;
}>;

export type CreateProjectRequestDto = Readonly<{
  name: string;
}>;

export type UpdateProjectRequestDto = Readonly<{
  name?: string;
}>;

export type ProjectResponseDto = Readonly<{
  project: ProjectDto;
}>;

export type ListProjectsResponseDto = Readonly<{
  projects: readonly ProjectDto[];
}>;

export type FolderKindDto = "workspaceRoot" | "projectRoot" | "regular" | "inbox";

export type FolderDto = Readonly<{
  id: FolderId;
  workspaceId: WorkspaceId;
  projectId: ProjectId | null;
  name: string;
  kind: FolderKindDto;
  parentFolderId: FolderId | null;
}>;

export type CreateFolderRequestDto = Readonly<{
  parentFolderId: FolderId;
  name: string;
}>;

export type UpdateFolderRequestDto = Readonly<{
  name?: string;
}>;

export type MoveFolderRequestDto = Readonly<{
  targetParentFolderId: FolderId;
}>;

export type FolderResponseDto = Readonly<{
  folder: FolderDto;
}>;

export type DocumentStateDto = "draft" | "review" | "saved";

export type DocumentPropertyValueDto =
  | Readonly<{ type: "text"; value: string }>
  | Readonly<{ type: "status"; value: string }>
  | Readonly<{ type: "date"; value: string }>
  | Readonly<{ type: "member"; value: WorkspaceMembershipId }>
  | Readonly<{ type: "checkbox"; value: boolean }>;

export type DocumentPropertyDto = Readonly<{
  key: string;
  value: DocumentPropertyValueDto;
}>;

export type DocumentLinkDto = Readonly<{
  sourceDocumentId: DocumentId;
  targetDocumentId: DocumentId;
  markdownHref: string;
  targetTitle: string;
  preview: string;
}>;

export type BacklinkDto = Readonly<{
  sourceDocumentId: DocumentId;
  targetDocumentId: DocumentId;
  markdownHref: string;
  sourceTitle: string;
  preview: string;
}>;

export type ArtifactReferenceDto = Readonly<{
  key: string;
  contentType: string;
  checksumSha256: string;
  sizeBytes: number;
}>;

export type DocumentSummaryDto = Readonly<{
  id: DocumentId;
  folderId: FolderId;
  title: string;
  state: DocumentStateDto;
  latestRevisionId: RevisionId | null;
  publishedRevisionId: RevisionId | null;
}>;

export type ArchivedDocumentDto = DocumentSummaryDto &
  Readonly<{
    archivedAt: string;
  }>;

export type DocumentDetailDto = DocumentSummaryDto &
  Readonly<{
    markdownBody: string;
    properties: readonly DocumentPropertyDto[];
  }>;

export type DocumentContentSourceDto = "collaboration-projection" | "manual-import";

export type DocumentContentDto = Readonly<{
  documentId: DocumentId;
  markdownBody: string;
  latestRevisionId: RevisionId | null;
  updatedAt: string;
}>;

export type CreateDocumentRequestDto = Readonly<{
  title: string;
  initialMarkdownBody?: string;
  state?: DocumentStateDto;
  properties?: readonly DocumentPropertyDto[];
}>;

export type UpdateDocumentRequestDto = Readonly<{
  title?: string;
  state?: DocumentStateDto;
}>;

export type MoveDocumentRequestDto = Readonly<{
  targetFolderId: FolderId;
}>;

export type UpdateDocumentContentRequestDto = Readonly<{
  markdownBody: string;
  baseRevisionId?: RevisionId;
  source: DocumentContentSourceDto;
}>;

export type ReplaceDocumentPropertiesRequestDto = Readonly<{
  properties: readonly DocumentPropertyDto[];
}>;

export type DocumentResponseDto = Readonly<{
  document: DocumentDetailDto;
}>;

export type DocumentContentResponseDto = Readonly<{
  content: DocumentContentDto;
}>;

export type ListDocumentsResponseDto = Readonly<{
  documents: readonly DocumentSummaryDto[];
}>;

export type ListArchivedDocumentsResponseDto = Readonly<{
  documents: readonly ArchivedDocumentDto[];
}>;

export type WorkspaceNavigationResponseDto = Readonly<{
  workspace: WorkspaceDto;
  projects: readonly ProjectDto[];
  folders: readonly FolderDto[];
  documents: readonly DocumentSummaryDto[];
}>;

export type FolderChildrenResponseDto = Readonly<{
  folder: FolderDto;
  folders: readonly FolderDto[];
  documents: readonly DocumentSummaryDto[];
}>;

export type DeletedResourceResponseDto = Readonly<{
  id: string;
  deletedAt: string;
}>;

export type DocumentConnectionsDto = Readonly<{
  documentId: DocumentId;
  links: readonly DocumentLinkDto[];
  backlinks: readonly BacklinkDto[];
}>;

export type DocumentConnectionsResponseDto = DocumentConnectionsDto;

export type MarkdownExportFrontmatterValueDto = string | number | boolean | null;

export type MarkdownExportFrontmatterDto = Readonly<
  Record<string, MarkdownExportFrontmatterValueDto>
>;

export type MarkdownExportDto = Readonly<{
  documentId: DocumentId;
  filename: string;
  contentType: "text/markdown; charset=utf-8";
  frontmatter: MarkdownExportFrontmatterDto;
  markdownBody: string;
  fileContents: string;
}>;

export type CreateMarkdownExportRequestDto = Readonly<{
  filename?: string;
}>;

export type MarkdownExportResponseDto = MarkdownExportDto;

export type UploadedDocumentImageDto = Readonly<{
  documentId: DocumentId;
  artifact: ArtifactReferenceDto;
  filename: string;
  altText: string | null;
  markdownImage: string;
  url: string;
}>;

export type MultipartFilePartDto = Readonly<{
  fieldName: "file";
  filename: string;
  contentType: string;
  checksumSha256: string;
  sizeBytes: number;
}>;

export type CreateImageUploadRequestDto = Readonly<{
  file: MultipartFilePartDto;
  altText?: string;
}>;

export type ImageUploadResponseDto = Readonly<{
  image: UploadedDocumentImageDto;
}>;

export type RevisionSourceDto = "checkpoint" | "publication";

export type RevisionDto = Readonly<{
  id: RevisionId;
  documentId: DocumentId;
  authorMembershipId: WorkspaceMembershipId;
  source: RevisionSourceDto;
  message: string | null;
  createdAt: string;
  snapshotArtifact: ArtifactReferenceDto;
}>;

export type CheckpointDto = Readonly<{
  id: CheckpointId;
  documentId: DocumentId;
  revisionId: RevisionId;
  authorMembershipId: WorkspaceMembershipId;
  message: string;
  createdAt: string;
  snapshotArtifact: ArtifactReferenceDto;
}>;

export type PublicationDto = Readonly<{
  id: PublicationId;
  documentId: DocumentId;
  revisionId: RevisionId;
  publishedByMembershipId: WorkspaceMembershipId;
  publishedAt: string;
}>;

export type AutosaveStatusDto = "pending" | "saved" | "failed";

export type AutosaveSnapshotDto = Readonly<{
  documentId: DocumentId;
  savedAt: string;
  artifact: ArtifactReferenceDto;
  status: AutosaveStatusDto;
}>;

export type SeedReviewContextDto = Readonly<{
  currentMemberId: WorkspaceMembershipId;
  users: readonly UserDto[];
  workspace: WorkspaceDto;
  project: ProjectDto;
  folder: FolderDto;
  folders: readonly FolderDto[];
  document: DocumentDetailDto;
  documents: readonly DocumentDetailDto[];
  members: readonly WorkspaceMemberDto[];
  backlinks: readonly BacklinkDto[];
  collaboration: CollaborationSessionDto;
  revisions: readonly RevisionDto[];
  checkpoints: readonly CheckpointDto[];
  publications: readonly PublicationDto[];
  autosaves: readonly AutosaveSnapshotDto[];
}>;

export type CheckpointSnapshotInspectDto = Readonly<{
  checkpointId: CheckpointId;
  documentId: DocumentId;
  revisionId: RevisionId;
  markdownBody: string;
  artifact: ArtifactReferenceDto;
}>;

export type DocumentSnapshotInspectDto = CheckpointSnapshotInspectDto;

export type CreateCheckpointRequestDto = Readonly<{
  message: string;
}>;

export type CreateCheckpointResponseDto = Readonly<{
  checkpoint: CheckpointDto;
}>;

export type ListCheckpointsResponseDto = Readonly<{
  checkpoints: readonly CheckpointDto[];
}>;

export type CheckpointSnapshotInspectResponseDto = CheckpointSnapshotInspectDto;

export type DocumentReviewStateDto = Readonly<{
  document: DocumentDetailDto;
  sync: DocumentSyncStateDto;
  latestRevision: RevisionDto | null;
  currentPublication: PublicationDto | null;
}>;

export type CreateCollaborationSessionRequestDto = Readonly<{
  clientId?: string;
}>;

export type CollaborationSessionQueryDto = Readonly<{
  memberId?: WorkspaceMembershipId;
}>;

export type CollaborationSessionResponseDto = IssuedCollaborationSessionDto;

export * from "./errors.js";
export * from "./routes.js";
export * from "./schemas.js";
