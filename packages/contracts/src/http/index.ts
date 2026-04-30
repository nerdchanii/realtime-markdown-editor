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

export type WorkspaceMemberDto = Readonly<{
  id: WorkspaceMembershipId;
  userId: UserId;
  workspaceId: WorkspaceId;
  displayName: string;
  color: string;
  role: WorkspaceMemberRoleDto;
}>;

export type WorkspaceDto = Readonly<{
  id: WorkspaceId;
  name: string;
  rootFolderId: FolderId;
}>;

export type ProjectDto = Readonly<{
  id: ProjectId;
  workspaceId: WorkspaceId;
  name: string;
  rootFolderId: FolderId;
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

export type DocumentDetailDto = DocumentSummaryDto &
  Readonly<{
    markdownBody: string;
    properties: readonly DocumentPropertyDto[];
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
  documentId: DocumentId;
  filename: string;
  properties: readonly DocumentPropertyDto[];
  markdownBody: string;
}>;

export type MarkdownExportResponseDto = MarkdownExportDto;

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
  documentId: DocumentId;
  authorMembershipId: WorkspaceMembershipId;
  message: string;
  markdownSnapshot: string;
  source: "collaboration";
}>;

export type CreateCheckpointResponseDto = Readonly<{
  checkpoint: CheckpointDto;
}>;

export type ListCheckpointsResponseDto = Readonly<{
  checkpoints: readonly CheckpointDto[];
}>;

export type DocumentReviewStateDto = Readonly<{
  document: DocumentDetailDto;
  sync: DocumentSyncStateDto;
  latestRevision: RevisionDto | null;
  currentPublication: PublicationDto | null;
}>;

export type CollaborationSessionResponseDto = IssuedCollaborationSessionDto;
