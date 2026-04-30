-- CreateEnum
CREATE TYPE "WorkspaceMembershipRole" AS ENUM ('owner', 'member');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('active', 'revoked', 'expired');

-- CreateEnum
CREATE TYPE "FolderKind" AS ENUM ('workspaceRoot', 'projectRoot', 'regular', 'inbox');

-- CreateEnum
CREATE TYPE "DocumentState" AS ENUM ('draft', 'review', 'saved');

-- CreateEnum
CREATE TYPE "DocumentPropertyType" AS ENUM ('text', 'status', 'date', 'member', 'checkbox');

-- CreateEnum
CREATE TYPE "DocumentContentSource" AS ENUM ('collaboration-projection', 'manual-import');

-- CreateEnum
CREATE TYPE "ArtifactKind" AS ENUM ('checkpoint-snapshot', 'export', 'image', 'collaboration-state', 'autosave-snapshot');

-- CreateEnum
CREATE TYPE "RevisionSource" AS ENUM ('checkpoint', 'publication', 'autosave', 'content-update');

-- CreateEnum
CREATE TYPE "AutosaveStatus" AS ENUM ('pending', 'saved', 'failed');

-- CreateEnum
CREATE TYPE "CollaborationSyncStatus" AS ENUM ('connecting', 'synced', 'offline', 'reconnecting', 'pending-local-changes', 'error');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(80) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" VARCHAR(80) NOT NULL,
    "tokenHash" VARCHAR(128) NOT NULL,
    "userId" VARCHAR(80) NOT NULL,
    "currentMembershipId" VARCHAR(80),
    "status" "SessionStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_memberships" (
    "id" VARCHAR(80) NOT NULL,
    "userId" VARCHAR(80) NOT NULL,
    "workspaceId" VARCHAR(80) NOT NULL,
    "displayName" VARCHAR(160) NOT NULL,
    "color" VARCHAR(32) NOT NULL,
    "role" "WorkspaceMembershipRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" VARCHAR(80) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "rootFolderId" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" VARCHAR(80) NOT NULL,
    "workspaceId" VARCHAR(80) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "rootFolderId" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" VARCHAR(80) NOT NULL,
    "workspaceId" VARCHAR(80) NOT NULL,
    "projectId" VARCHAR(80),
    "parentFolderId" VARCHAR(80),
    "name" VARCHAR(200) NOT NULL,
    "kind" "FolderKind" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" VARCHAR(80) NOT NULL,
    "folderId" VARCHAR(80) NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "state" "DocumentState" NOT NULL DEFAULT 'draft',
    "markdownBodyRef" VARCHAR(512) NOT NULL,
    "markdownBody" TEXT NOT NULL DEFAULT '',
    "contentSource" "DocumentContentSource" NOT NULL DEFAULT 'manual-import',
    "markdownBodyUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latestRevisionId" VARCHAR(80),
    "publishedRevisionId" VARCHAR(80),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_properties" (
    "id" UUID NOT NULL,
    "documentId" VARCHAR(80) NOT NULL,
    "key" VARCHAR(120) NOT NULL,
    "type" "DocumentPropertyType" NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_edges" (
    "id" UUID NOT NULL,
    "sourceDocumentId" VARCHAR(80) NOT NULL,
    "targetDocumentId" VARCHAR(80) NOT NULL,
    "markdownHref" VARCHAR(512) NOT NULL,
    "preview" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "link_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artifacts" (
    "id" UUID NOT NULL,
    "documentId" VARCHAR(80),
    "key" VARCHAR(768) NOT NULL,
    "kind" "ArtifactKind" NOT NULL,
    "contentType" VARCHAR(160) NOT NULL,
    "checksumSha256" CHAR(64) NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revisions" (
    "id" VARCHAR(80) NOT NULL,
    "documentId" VARCHAR(80) NOT NULL,
    "authorMembershipId" VARCHAR(80) NOT NULL,
    "source" "RevisionSource" NOT NULL,
    "message" VARCHAR(500),
    "snapshotArtifactId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkpoints" (
    "id" VARCHAR(80) NOT NULL,
    "documentId" VARCHAR(80) NOT NULL,
    "revisionId" VARCHAR(80) NOT NULL,
    "authorMembershipId" VARCHAR(80) NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "snapshotArtifactId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" VARCHAR(80) NOT NULL,
    "documentId" VARCHAR(80) NOT NULL,
    "revisionId" VARCHAR(80) NOT NULL,
    "publishedByMembershipId" VARCHAR(80) NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autosave_snapshots" (
    "id" UUID NOT NULL,
    "documentId" VARCHAR(80) NOT NULL,
    "artifactId" UUID NOT NULL,
    "status" "AutosaveStatus" NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autosave_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_collaboration_states" (
    "id" UUID NOT NULL,
    "documentId" VARCHAR(80) NOT NULL,
    "documentKey" VARCHAR(240) NOT NULL,
    "realtimeUrl" VARCHAR(512) NOT NULL,
    "syncStatus" "CollaborationSyncStatus" NOT NULL DEFAULT 'connecting',
    "pendingLocalEdits" INTEGER NOT NULL DEFAULT 0,
    "lastSyncedAt" TIMESTAMP(3),
    "stateArtifactId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_collaboration_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_collaboration_sessions" (
    "id" UUID NOT NULL,
    "documentId" VARCHAR(80) NOT NULL,
    "membershipId" VARCHAR(80) NOT NULL,
    "stateId" UUID,
    "sessionTokenHash" VARCHAR(128) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "live_collaboration_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_currentMembershipId_idx" ON "sessions"("currentMembershipId");

-- CreateIndex
CREATE INDEX "sessions_status_expiresAt_idx" ON "sessions"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "workspace_memberships_userId_idx" ON "workspace_memberships"("userId");

-- CreateIndex
CREATE INDEX "workspace_memberships_workspaceId_idx" ON "workspace_memberships"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_memberships_workspaceId_userId_key" ON "workspace_memberships"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_rootFolderId_key" ON "workspaces"("rootFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_rootFolderId_key" ON "projects"("rootFolderId");

-- CreateIndex
CREATE INDEX "projects_workspaceId_idx" ON "projects"("workspaceId");

-- CreateIndex
CREATE INDEX "folders_workspaceId_parentFolderId_idx" ON "folders"("workspaceId", "parentFolderId");

-- CreateIndex
CREATE INDEX "folders_projectId_idx" ON "folders"("projectId");

-- CreateIndex
CREATE INDEX "folders_kind_idx" ON "folders"("kind");

-- CreateIndex
CREATE UNIQUE INDEX "documents_latestRevisionId_key" ON "documents"("latestRevisionId");

-- CreateIndex
CREATE UNIQUE INDEX "documents_publishedRevisionId_key" ON "documents"("publishedRevisionId");

-- CreateIndex
CREATE INDEX "documents_folderId_idx" ON "documents"("folderId");

-- CreateIndex
CREATE INDEX "documents_state_idx" ON "documents"("state");

-- CreateIndex
CREATE INDEX "document_properties_type_idx" ON "document_properties"("type");

-- CreateIndex
CREATE UNIQUE INDEX "document_properties_documentId_key_key" ON "document_properties"("documentId", "key");

-- CreateIndex
CREATE INDEX "link_edges_targetDocumentId_idx" ON "link_edges"("targetDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "link_edges_sourceDocumentId_targetDocumentId_markdownHref_key" ON "link_edges"("sourceDocumentId", "targetDocumentId", "markdownHref");

-- CreateIndex
CREATE UNIQUE INDEX "artifacts_key_key" ON "artifacts"("key");

-- CreateIndex
CREATE INDEX "artifacts_documentId_idx" ON "artifacts"("documentId");

-- CreateIndex
CREATE INDEX "artifacts_kind_idx" ON "artifacts"("kind");

-- CreateIndex
CREATE INDEX "revisions_documentId_createdAt_idx" ON "revisions"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "revisions_authorMembershipId_idx" ON "revisions"("authorMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoints_revisionId_key" ON "checkpoints"("revisionId");

-- CreateIndex
CREATE INDEX "checkpoints_documentId_createdAt_idx" ON "checkpoints"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "checkpoints_authorMembershipId_idx" ON "checkpoints"("authorMembershipId");

-- CreateIndex
CREATE UNIQUE INDEX "publications_revisionId_key" ON "publications"("revisionId");

-- CreateIndex
CREATE INDEX "publications_documentId_publishedAt_idx" ON "publications"("documentId", "publishedAt");

-- CreateIndex
CREATE INDEX "publications_publishedByMembershipId_idx" ON "publications"("publishedByMembershipId");

-- CreateIndex
CREATE INDEX "autosave_snapshots_documentId_savedAt_idx" ON "autosave_snapshots"("documentId", "savedAt");

-- CreateIndex
CREATE INDEX "autosave_snapshots_status_idx" ON "autosave_snapshots"("status");

-- CreateIndex
CREATE UNIQUE INDEX "live_collaboration_states_documentId_key" ON "live_collaboration_states"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "live_collaboration_states_documentKey_key" ON "live_collaboration_states"("documentKey");

-- CreateIndex
CREATE INDEX "live_collaboration_states_syncStatus_idx" ON "live_collaboration_states"("syncStatus");

-- CreateIndex
CREATE UNIQUE INDEX "live_collaboration_sessions_sessionTokenHash_key" ON "live_collaboration_sessions"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "live_collaboration_sessions_documentId_membershipId_idx" ON "live_collaboration_sessions"("documentId", "membershipId");

-- CreateIndex
CREATE INDEX "live_collaboration_sessions_expiresAt_idx" ON "live_collaboration_sessions"("expiresAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_currentMembershipId_fkey" FOREIGN KEY ("currentMembershipId") REFERENCES "workspace_memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_latestRevisionId_fkey" FOREIGN KEY ("latestRevisionId") REFERENCES "revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_publishedRevisionId_fkey" FOREIGN KEY ("publishedRevisionId") REFERENCES "revisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_properties" ADD CONSTRAINT "document_properties_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_edges" ADD CONSTRAINT "link_edges_sourceDocumentId_fkey" FOREIGN KEY ("sourceDocumentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_edges" ADD CONSTRAINT "link_edges_targetDocumentId_fkey" FOREIGN KEY ("targetDocumentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_authorMembershipId_fkey" FOREIGN KEY ("authorMembershipId") REFERENCES "workspace_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_snapshotArtifactId_fkey" FOREIGN KEY ("snapshotArtifactId") REFERENCES "artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_authorMembershipId_fkey" FOREIGN KEY ("authorMembershipId") REFERENCES "workspace_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoints" ADD CONSTRAINT "checkpoints_snapshotArtifactId_fkey" FOREIGN KEY ("snapshotArtifactId") REFERENCES "artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publications" ADD CONSTRAINT "publications_publishedByMembershipId_fkey" FOREIGN KEY ("publishedByMembershipId") REFERENCES "workspace_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autosave_snapshots" ADD CONSTRAINT "autosave_snapshots_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autosave_snapshots" ADD CONSTRAINT "autosave_snapshots_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_collaboration_states" ADD CONSTRAINT "live_collaboration_states_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_collaboration_states" ADD CONSTRAINT "live_collaboration_states_stateArtifactId_fkey" FOREIGN KEY ("stateArtifactId") REFERENCES "artifacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_collaboration_sessions" ADD CONSTRAINT "live_collaboration_sessions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_collaboration_sessions" ADD CONSTRAINT "live_collaboration_sessions_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "workspace_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_collaboration_sessions" ADD CONSTRAINT "live_collaboration_sessions_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "live_collaboration_states"("id") ON DELETE SET NULL ON UPDATE CASCADE;
