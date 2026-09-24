import type {
  ArtifactReferenceDto,
  AutosaveSnapshotDto,
  BacklinkDto,
  CheckpointDto,
  CheckpointId,
  CheckpointSnapshotInspectDto,
  CollaborationSessionDto,
  DocumentDetailDto,
  DocumentId,
  DocumentSyncStateDto,
  FolderDto,
  FolderId,
  ListCheckpointsResponseDto,
  ProjectDto,
  ProjectId,
  PublicationDto,
  PublicationId,
  RevisionDto,
  RevisionId,
  UserDto,
  UserId,
  WorkspaceDto,
  WorkspaceId,
  WorkspaceMemberDto,
  WorkspaceMembershipId,
} from "./index.js";

const workspaceId = "workspace_seed" as WorkspaceId;
const projectId = "project_seed" as ProjectId;
const folderId = "folder_seed" as FolderId;
const documentId = "document_seed" as DocumentId;
const userId = "user_alice" as UserId;
const membershipId = "membership_alice" as WorkspaceMembershipId;
const revisionId = "revision_seed" as RevisionId;
const checkpointId = "checkpoint_seed" as CheckpointId;
const publicationId = "publication_seed" as PublicationId;

const user = {
  id: userId,
  email: "alice@example.test",
  name: "Alice",
} satisfies UserDto;

const member = {
  id: membershipId,
  userId,
  workspaceId,
  displayName: "Alice",
  color: "#0969da",
  role: "owner",
} satisfies WorkspaceMemberDto;

const workspace = {
  id: workspaceId,
  name: "Seed Workspace",
  rootFolderId: folderId,
} satisfies WorkspaceDto;

const project = {
  id: projectId,
  workspaceId,
  name: "Seed Project",
  rootFolderId: folderId,
} satisfies ProjectDto;

const folder = {
  id: folderId,
  workspaceId,
  projectId,
  name: "Project Root",
  kind: "projectRoot",
  parentFolderId: null,
} satisfies FolderDto;

const artifact = {
  key: "documents/document_seed/revisions/revision_seed.md",
  contentType: "text/markdown; charset=utf-8",
  checksumSha256: "0".repeat(64),
  sizeBytes: 120,
} satisfies ArtifactReferenceDto;

const revision = {
  id: revisionId,
  documentId,
  authorMembershipId: membershipId,
  source: "checkpoint",
  message: "Capture architecture notes",
  createdAt: "2026-04-30T00:00:00.000Z",
  snapshotArtifact: artifact,
} satisfies RevisionDto;

const checkpoint = {
  id: checkpointId,
  documentId,
  revisionId,
  authorMembershipId: membershipId,
  message: "Capture architecture notes",
  createdAt: "2026-04-30T00:00:00.000Z",
  snapshotArtifact: artifact,
} satisfies CheckpointDto;

const inspectSnapshot = {
  checkpointId,
  documentId,
  revisionId,
  markdownBody: "# Architecture Notes",
  artifact,
} satisfies CheckpointSnapshotInspectDto;

const checkpointList = {
  checkpoints: [checkpoint],
} satisfies ListCheckpointsResponseDto;

const publication = {
  id: publicationId,
  documentId,
  revisionId,
  publishedByMembershipId: membershipId,
  publishedAt: "2026-04-30T00:00:00.000Z",
} satisfies PublicationDto;

const autosave = {
  documentId,
  savedAt: "2026-04-30T00:00:00.000Z",
  artifact,
  status: "saved",
} satisfies AutosaveSnapshotDto;

const document = {
  id: documentId,
  folderId,
  title: "Architecture Notes",
  state: "draft",
  markdownBody: "# Review Plan",
  properties: [{ key: "status", value: { type: "status", value: "Draft" } }],
  latestRevisionId: revisionId,
  publishedRevisionId: revisionId,
} satisfies DocumentDetailDto;

const backlink = {
  sourceDocumentId: documentId,
  targetDocumentId: documentId,
  markdownHref: "./architecture-notes.md",
  sourceTitle: "Architecture Notes",
  preview: "Linked from the seeded workspace context.",
} satisfies BacklinkDto;

const sync = {
  status: "offline",
  pendingLocalEdits: 1,
  lastSyncedAt: null,
} satisfies DocumentSyncStateDto;

const collaboration = {
  documentId,
  documentKey: "workspace_seed:document_seed",
  realtimeUrl: "ws://127.0.0.1:4000/collaboration/document_seed",
  currentMemberId: membershipId,
  members: [member],
  sync,
} satisfies CollaborationSessionDto;

void user;
void workspace;
void project;
void folder;
void document;
void backlink;
void collaboration;
void revision;
void checkpoint;
void publication;
void autosave;
void inspectSnapshot;
void checkpointList;
