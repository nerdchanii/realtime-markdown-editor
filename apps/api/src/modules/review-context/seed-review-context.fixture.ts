import type { CheckpointId } from "@/modules/documents/domain/checkpoint.js";
import type { DocumentId } from "@/modules/documents/domain/document.js";
import type { WorkspaceMembershipId } from "@/modules/documents/domain/references.js";
import type { UserId } from "@/modules/identity/domain/user.js";
import type { FolderId } from "@/modules/workspace/domain/folder.js";
import type { ProjectId } from "@/modules/workspace/domain/project.js";
import type { WorkspaceId } from "@/modules/workspace/domain/workspace.js";
import {
  decisionLogMarkdown,
  reviewPlanMarkdown,
} from "@/modules/review-context/seed-review-context-markdown.fixture.js";
import type { SeedReviewContext } from "@/modules/review-context/use-cases/seed-review-context.js";

type RevisionId = string & { readonly __brand: "RevisionId" };
type PublicationId = string & { readonly __brand: "PublicationId" };

const workspaceId = "workspace_review" as WorkspaceId;
const projectId = "project_launch-readiness" as ProjectId;
const workspaceRootFolderId = "folder_workspace_root" as FolderId;
const projectRootFolderId = "folder_project_root" as FolderId;
const notesFolderId = "folder_project_notes" as FolderId;
const reviewPlanDocumentId = "document_review_plan" as DocumentId;
const decisionsDocumentId = "document_decision_log" as DocumentId;
const aliceUserId = "user_alice" as UserId;
const benUserId = "user_ben" as UserId;
const aliceMembershipId = "member_alice" as WorkspaceMembershipId;
const benMembershipId = "member_ben" as WorkspaceMembershipId;
const reviewRevisionId = "revision_review_plan_001" as RevisionId;
const decisionsRevisionId = "revision_decision_log_001" as RevisionId;
const reviewCheckpointId = "checkpoint_review_plan_001" as CheckpointId;
const decisionsCheckpointId = "checkpoint_decision_log_001" as CheckpointId;
const reviewPublicationId = "publication_review_plan_001" as PublicationId;

const seedCreatedAt = new Date("2026-04-30T00:00:00.000Z");
const seedSyncedAt = new Date("2026-04-30T00:03:00.000Z");

const reviewPlanArtifact = {
  key: "seed/workspaces/workspace_review/documents/document_review_plan/revisions/revision_review_plan_001.md",
  contentType: "text/markdown; charset=utf-8",
  checksumSha256: "1".repeat(64),
  sizeBytes: reviewPlanMarkdown.length,
};

const decisionLogArtifact = {
  key: "seed/workspaces/workspace_review/documents/document_decision_log/revisions/revision_decision_log_001.md",
  contentType: "text/markdown; charset=utf-8",
  checksumSha256: "2".repeat(64),
  sizeBytes: decisionLogMarkdown.length,
};

const aliceMembership = {
  id: aliceMembershipId,
  userId: aliceUserId,
  workspaceId,
  displayName: "Alice",
  color: "#0969da",
  role: "owner",
} as const;

const benMembership = {
  id: benMembershipId,
  userId: benUserId,
  workspaceId,
  displayName: "Ben",
  color: "#1a7f37",
  role: "editor",
} as const;

const reviewPlanDocument = {
  id: reviewPlanDocumentId,
  folderId: notesFolderId,
  title: "Review Plan",
  markdownBodyRef: reviewPlanArtifact.key,
  markdownBody: reviewPlanMarkdown,
  state: "review",
  properties: [
    { key: "Status", value: { type: "status", value: "In Review" } },
    { key: "Owner", value: { type: "member", value: aliceMembershipId } },
    { key: "Target Date", value: { type: "date", value: "2026-04-30" } },
    { key: "CE Evidence Visible", value: { type: "checkbox", value: true } },
  ],
  latestRevisionId: reviewRevisionId,
  publishedRevisionId: reviewRevisionId,
} as const;

const decisionLogDocument = {
  id: decisionsDocumentId,
  folderId: notesFolderId,
  title: "Decision Log",
  markdownBodyRef: decisionLogArtifact.key,
  markdownBody: decisionLogMarkdown,
  state: "draft",
  properties: [
    { key: "Status", value: { type: "status", value: "Draft" } },
    { key: "Owner", value: { type: "member", value: benMembershipId } },
  ],
  latestRevisionId: decisionsRevisionId,
  publishedRevisionId: null,
} as const;

export const seedReviewContext: SeedReviewContext = {
  currentMemberId: aliceMembershipId,
  users: [
    { id: aliceUserId, email: "alice@example.test", name: "Alice Kim" },
    { id: benUserId, email: "ben@example.test", name: "Ben Park" },
  ],
  workspace: {
    id: workspaceId,
    name: "Review Workspace",
    rootFolderId: workspaceRootFolderId,
  },
  project: {
    id: projectId,
    workspaceId,
    name: "Launch Readiness",
    rootFolderId: projectRootFolderId,
  },
  selectedFolder: {
    id: notesFolderId,
    workspaceId,
    projectId,
    name: "Notes",
    kind: "regular",
    parentFolderId: projectRootFolderId,
  },
  folders: [
    {
      id: workspaceRootFolderId,
      workspaceId,
      projectId: null,
      name: "Review Workspace",
      kind: "workspaceRoot",
      parentFolderId: null,
    },
    {
      id: projectRootFolderId,
      workspaceId,
      projectId,
      name: "Launch Readiness",
      kind: "projectRoot",
      parentFolderId: null,
    },
    {
      id: notesFolderId,
      workspaceId,
      projectId,
      name: "Notes",
      kind: "regular",
      parentFolderId: projectRootFolderId,
    },
  ],
  selectedDocument: reviewPlanDocument,
  documents: [reviewPlanDocument, decisionLogDocument],
  members: [aliceMembership, benMembership],
  backlinks: [
    {
      sourceDocumentId: decisionsDocumentId,
      targetDocumentId: reviewPlanDocumentId,
      markdownHref: "./review-plan.md",
      sourceTitle: "Decision Log",
      preview: "The launch readiness review starts from Review Plan.",
    },
  ],
  collaboration: {
    documentId: reviewPlanDocumentId,
    documentKey: "workspace_review/document_review_plan",
    realtimeUrl: "ws://127.0.0.1:4000/collaboration/workspace_review/document_review_plan",
    currentMemberId: aliceMembershipId,
    members: [aliceMembership, benMembership],
    sync: {
      status: "synced",
      pendingLocalEdits: 0,
      lastSyncedAt: seedSyncedAt,
    },
  },
  revisions: [
    {
      id: reviewRevisionId,
      documentId: reviewPlanDocumentId,
      authorMembershipId: aliceMembershipId,
      source: "checkpoint",
      message: "Capture CE review path",
      createdAt: seedCreatedAt,
      snapshotArtifact: reviewPlanArtifact,
    },
    {
      id: decisionsRevisionId,
      documentId: decisionsDocumentId,
      authorMembershipId: benMembershipId,
      source: "checkpoint",
      message: "Capture initial decision log",
      createdAt: seedCreatedAt,
      snapshotArtifact: decisionLogArtifact,
    },
  ],
  checkpoints: [
    {
      id: reviewCheckpointId,
      documentId: reviewPlanDocumentId,
      revisionId: reviewRevisionId,
      authorMembershipId: aliceMembershipId,
      message: "Capture CE review path",
      createdAt: seedCreatedAt,
      snapshotArtifactRef: reviewPlanArtifact.key,
      snapshotArtifact: reviewPlanArtifact,
    },
    {
      id: decisionsCheckpointId,
      documentId: decisionsDocumentId,
      revisionId: decisionsRevisionId,
      authorMembershipId: benMembershipId,
      message: "Capture initial decision log",
      createdAt: seedCreatedAt,
      snapshotArtifactRef: decisionLogArtifact.key,
      snapshotArtifact: decisionLogArtifact,
    },
  ],
  publications: [
    {
      id: reviewPublicationId,
      documentId: reviewPlanDocumentId,
      revisionId: reviewRevisionId,
      publishedByMembershipId: aliceMembershipId,
      publishedAt: seedCreatedAt,
    },
  ],
  autosaves: [
    {
      documentId: reviewPlanDocumentId,
      savedAt: seedSyncedAt,
      artifact: reviewPlanArtifact,
      status: "saved",
    },
  ],
};
