import type { Checkpoint } from "@/modules/documents/domain/checkpoint.js";
import type { Document, DocumentId } from "@/modules/documents/domain/document.js";
import type { LinkEdge } from "@/modules/documents/domain/link-edge.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import type { User } from "@/modules/identity/domain/user.js";
import type { WorkspaceMembership } from "@/modules/identity/domain/workspace-membership.js";
import type { FolderId } from "@/modules/workspace/domain/folder.js";
import type { Project, ProjectId } from "@/modules/workspace/domain/project.js";
import type { Workspace } from "@/modules/workspace/domain/workspace.js";

export type SeedWorkspace = Workspace &
  Readonly<{
    rootFolderId: FolderId;
  }>;

export type SeedProject = Project &
  Readonly<{
    rootFolderId: FolderId;
  }>;

export type SeedFolderKind = "workspaceRoot" | "projectRoot" | "regular" | "inbox";

export type SeedFolder = Readonly<{
  id: FolderId;
  workspaceId: SeedWorkspace["id"];
  projectId: ProjectId | null;
  name: string;
  kind: SeedFolderKind;
  parentFolderId: FolderId | null;
}>;

export type SeedDocument = Document &
  Readonly<{
    markdownBody: string;
    latestRevisionId: SeedRevision["id"] | null;
    publishedRevisionId: SeedRevision["id"] | null;
  }>;

export type SeedArtifactReference = Readonly<{
  key: string;
  contentType: string;
  checksumSha256: string;
  sizeBytes: number;
}>;

export type SeedRevisionSource = "checkpoint" | "publication";

export type SeedRevision = Readonly<{
  id: string & { readonly __brand: "RevisionId" };
  documentId: DocumentId;
  authorMembershipId: WorkspaceMembershipId;
  source: SeedRevisionSource;
  message: string | null;
  createdAt: Date;
  snapshotArtifact: SeedArtifactReference;
}>;

export type SeedCheckpoint = Checkpoint &
  Readonly<{
    revisionId: SeedRevision["id"];
    snapshotArtifact: SeedArtifactReference;
  }>;

export type SeedPublication = Readonly<{
  id: string & { readonly __brand: "PublicationId" };
  documentId: DocumentId;
  revisionId: SeedRevision["id"];
  publishedByMembershipId: WorkspaceMembershipId;
  publishedAt: Date;
}>;

export type SeedAutosaveStatus = "pending" | "saved" | "failed";

export type SeedAutosaveSnapshot = Readonly<{
  documentId: DocumentId;
  savedAt: Date;
  artifact: SeedArtifactReference;
  status: SeedAutosaveStatus;
}>;

export type SeedBacklink = LinkEdge &
  Readonly<{
    sourceTitle: string;
    preview: string;
  }>;

export type SeedDocumentSyncStatus =
  | "connecting"
  | "synced"
  | "offline"
  | "reconnecting"
  | "pending-local-changes"
  | "error";

export type SeedDocumentSyncState = Readonly<{
  status: SeedDocumentSyncStatus;
  pendingLocalEdits: number;
  lastSyncedAt: Date | null;
}>;

export type SeedCollaborationSession = Readonly<{
  documentId: DocumentId;
  documentKey: string;
  realtimeUrl: string;
  currentMemberId: WorkspaceMembershipId;
  members: readonly WorkspaceMembership[];
  sync: SeedDocumentSyncState;
}>;

export type SeedReviewContext = Readonly<{
  currentMemberId: WorkspaceMembershipId;
  users: readonly User[];
  workspace: SeedWorkspace;
  project: SeedProject;
  selectedFolder: SeedFolder;
  folders: readonly SeedFolder[];
  selectedDocument: SeedDocument;
  documents: readonly SeedDocument[];
  members: readonly WorkspaceMembership[];
  backlinks: readonly SeedBacklink[];
  collaboration: SeedCollaborationSession;
  revisions: readonly SeedRevision[];
  checkpoints: readonly SeedCheckpoint[];
  publications: readonly SeedPublication[];
  autosaves: readonly SeedAutosaveSnapshot[];
}>;
