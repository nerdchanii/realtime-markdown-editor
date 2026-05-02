import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { expect, type Page } from "@playwright/test";

import {
  localProductPassword,
  localProductPasswordHash,
  localProductPasswordSalt,
  localProductSeedSpec,
} from "../../scripts/product-seed-spec.mjs";

type PrismaModel = {
  upsert(args: unknown): Promise<unknown>;
};

type PrismaUpdatableModel = PrismaModel & {
  update(args: unknown): Promise<unknown>;
};

type PrismaFixtureClient = {
  workspace: PrismaUpdatableModel;
  folder: PrismaModel;
  project: PrismaUpdatableModel;
  user: PrismaModel;
  workspaceMembership: PrismaModel;
  document: PrismaModel;
  documentProperty: PrismaModel;
  linkEdge: PrismaModel;
  $disconnect(): Promise<void>;
};

type WorkspaceScaffold = Readonly<{
  workspaceId: string;
  workspaceName: string;
  workspaceRootFolderId: string;
  projectId: string;
  projectName: string;
  projectRootFolderId: string;
}>;

export const reviewerWorkspaceId = localProductSeedSpec.workspace.id;
export const reviewerProjectRootFolderId = localProductSeedSpec.project.rootFolderId;

const apiRequire = createRequire(new URL("../../apps/api/package.json", import.meta.url));
const { PrismaClient } = apiRequire("@prisma/client") as {
  PrismaClient: new () => PrismaFixtureClient;
};

export async function createProductSession(page: Page, email: string, workspaceId?: string) {
  const endpoint = `${apiBaseUrl()}/auth/session`;
  let lastError: string | null = null;
  const data = workspaceId
    ? { email, password: localProductPassword, workspaceId }
    : { email, password: localProductPassword };

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await page.request.post(endpoint, {
        data,
      });
      if (response.ok()) return;
      lastError = await response.text();
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    await page.waitForTimeout(500);
  }

  expect(false, lastError ?? "Timed out creating product session.").toBeTruthy();
}

export async function ensureStandaloneProductUser(
  email: string,
  name = "Standalone User",
  userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
) {
  const prisma = new PrismaClient();

  try {
    await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash: localProductPasswordHash,
        passwordSalt: localProductPasswordSalt,
      },
      create: {
        id: userId,
        email,
        name,
        passwordHash: localProductPasswordHash,
        passwordSalt: localProductPasswordSalt,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function ensureCe04ProductFixture() {
  const prisma = new PrismaClient();

  try {
    await seedWorkspaceScaffold(prisma, {
      workspaceId: "workspace_ce04",
      workspaceName: "CE-04 Workspace",
      workspaceRootFolderId: "folder_ce04_workspace_root",
      projectId: "project_ce04",
      projectName: "Editor Review",
      projectRootFolderId: "folder_ce04_project_root",
    });
    await seedMember(prisma, {
      userId: "user_ce04_alice",
      email: "ce04-alice@example.test",
      membershipId: "member_ce04_alice",
      workspaceId: "workspace_ce04",
      displayName: "Alice",
    });
    await prisma.document.upsert({
      where: { id: "document_ce04_plan" },
      update: {
        folderId: "folder_ce04_project_root",
        title: "Review Plan",
        state: "review",
        archivedAt: null,
        markdownBody: "# Review Plan\n\nThis document is loaded from product storage.",
        contentSource: "manualImport",
      },
      create: {
        id: "document_ce04_plan",
        folderId: "folder_ce04_project_root",
        title: "Review Plan",
        state: "review",
        markdownBodyRef: "documents/document_ce04_plan/current.md",
        markdownBody: "# Review Plan\n\nThis document is loaded from product storage.",
        contentSource: "manualImport",
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

export async function ensureReviewerProductFixture() {
  const prisma = new PrismaClient();

  try {
    await seedWorkspaceScaffold(prisma, {
      workspaceId: reviewerWorkspaceId,
      workspaceName: localProductSeedSpec.workspace.name,
      workspaceRootFolderId: localProductSeedSpec.workspace.rootFolderId,
      projectId: localProductSeedSpec.project.id,
      projectName: localProductSeedSpec.project.name,
      projectRootFolderId: reviewerProjectRootFolderId,
    });
    await seedReviewerMembers(prisma);
    await seedReviewerDocuments(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

export async function ensureReviewerProductDocument(documentId: string, title?: string) {
  if (documentId === "document_review_plan") return;

  const prisma = new PrismaClient();

  try {
    await prisma.document.upsert({
      where: { id: documentId },
      update: {
        folderId: reviewerProjectRootFolderId,
        title: title ?? titleFromDocumentId(documentId),
        state: "review",
        archivedAt: null,
        markdownBody: `# ${title ?? titleFromDocumentId(documentId)}\n\nThis document is loaded from product storage.`,
        contentSource: "manualImport",
      },
      create: {
        id: documentId,
        folderId: reviewerProjectRootFolderId,
        title: title ?? titleFromDocumentId(documentId),
        state: "review",
        markdownBodyRef: `documents/${documentId}/current.md`,
        markdownBody: `# ${title ?? titleFromDocumentId(documentId)}\n\nThis document is loaded from product storage.`,
        contentSource: "manualImport",
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

function apiBaseUrl() {
  return (
    process.env.RME_API_BASE_URL ?? process.env.VITE_RME_API_BASE_URL ?? "http://127.0.0.1:4000"
  );
}

async function seedWorkspaceScaffold(prisma: PrismaFixtureClient, scaffold: WorkspaceScaffold) {
  await prisma.workspace.upsert({
    where: { id: scaffold.workspaceId },
    update: { name: scaffold.workspaceName },
    create: { id: scaffold.workspaceId, name: scaffold.workspaceName },
  });
  await prisma.folder.upsert({
    where: { id: scaffold.workspaceRootFolderId },
    update: { name: "Workspace root", deletedAt: null },
    create: {
      id: scaffold.workspaceRootFolderId,
      workspaceId: scaffold.workspaceId,
      projectId: null,
      parentFolderId: null,
      name: "Workspace root",
      kind: "workspaceRoot",
    },
  });
  await prisma.workspace.update({
    where: { id: scaffold.workspaceId },
    data: { rootFolderId: scaffold.workspaceRootFolderId },
  });
  await prisma.project.upsert({
    where: { id: scaffold.projectId },
    update: { name: scaffold.projectName },
    create: {
      id: scaffold.projectId,
      workspaceId: scaffold.workspaceId,
      name: scaffold.projectName,
    },
  });
  await prisma.folder.upsert({
    where: { id: scaffold.projectRootFolderId },
    update: { name: "Project root", deletedAt: null },
    create: {
      id: scaffold.projectRootFolderId,
      workspaceId: scaffold.workspaceId,
      projectId: scaffold.projectId,
      parentFolderId: null,
      name: "Project root",
      kind: "projectRoot",
    },
  });
  await prisma.project.update({
    where: { id: scaffold.projectId },
    data: { rootFolderId: scaffold.projectRootFolderId },
  });
}

async function seedMember(
  prisma: PrismaFixtureClient,
  member: Readonly<{
    userId: string;
    email: string;
    membershipId: string;
    workspaceId: string;
    displayName: string;
    color?: string;
    role?: "owner" | "member";
  }>,
) {
  await prisma.user.upsert({
    where: { email: member.email },
    update: {
      name: member.displayName,
      passwordHash: localProductPasswordHash,
      passwordSalt: localProductPasswordSalt,
    },
    create: {
      id: member.userId,
      email: member.email,
      name: member.displayName,
      passwordHash: localProductPasswordHash,
      passwordSalt: localProductPasswordSalt,
    },
  });
  await prisma.workspaceMembership.upsert({
    where: { id: member.membershipId },
    update: {
      userId: member.userId,
      workspaceId: member.workspaceId,
      displayName: member.displayName,
      color: member.color ?? "#0969da",
      role: member.role ?? "owner",
      removedAt: null,
    },
    create: {
      id: member.membershipId,
      userId: member.userId,
      workspaceId: member.workspaceId,
      displayName: member.displayName,
      color: member.color ?? "#0969da",
      role: member.role ?? "owner",
    },
  });
}

async function seedReviewerMembers(prisma: PrismaFixtureClient) {
  for (const member of localProductSeedSpec.members) {
    await seedMember(prisma, {
      userId: member.userId,
      email: member.email,
      membershipId: member.membershipId,
      workspaceId: reviewerWorkspaceId,
      displayName: member.displayName,
      color: member.color,
      role: member.role,
    });
  }
}

async function seedReviewerDocuments(prisma: PrismaFixtureClient) {
  for (const seededDocument of localProductSeedSpec.documents) {
    const documentData = {
      folderId: reviewerProjectRootFolderId,
      title: seededDocument.title,
      state: seededDocument.state,
      archivedAt: null,
      markdownBody: readSeedMarkdown(seededDocument.sourcePath),
      contentSource: "manualImport",
    };
    await prisma.document.upsert({
      where: { id: seededDocument.id },
      update: documentData,
      create: {
        id: seededDocument.id,
        markdownBodyRef: `documents/${seededDocument.id}/current.md`,
        ...documentData,
      },
    });
  }

  for (const documentProperty of localProductSeedSpec.documentProperties) {
    await prisma.documentProperty.upsert({
      where: {
        documentId_key: { documentId: documentProperty.documentId, key: documentProperty.key },
      },
      update: { type: documentProperty.type, value: documentProperty.value },
      create: documentProperty,
    });
  }

  for (const linkEdge of localProductSeedSpec.linkEdges) {
    await prisma.linkEdge.upsert({
      where: {
        sourceDocumentId_targetDocumentId_markdownHref: {
          sourceDocumentId: linkEdge.sourceDocumentId,
          targetDocumentId: linkEdge.targetDocumentId,
          markdownHref: linkEdge.markdownHref,
        },
      },
      update: { preview: linkEdge.preview },
      create: linkEdge,
    });
  }
}

function readSeedMarkdown(sourcePath: string) {
  return readFileSync(new URL(`../../${sourcePath}`, import.meta.url), "utf8");
}

function titleFromDocumentId(documentId: string) {
  return documentId
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
