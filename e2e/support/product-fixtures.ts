import { createRequire } from "node:module";

import { expect, type Page } from "@playwright/test";

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

export const reviewerWorkspaceId = "workspace_review";
export const reviewerProjectRootFolderId = "folder_project_root";

const localProductPassword = "password";
const localProductPasswordSalt = "local-review-password-salt";
const localProductPasswordHash =
  "3bbff257761674495c3ad315d62259d7d7f1b13901c9c63eac6cb9bf189cc2f49d5254e6f2858b69cf2ac9cae04982f423a3253b239d3c450cb8c72785057e81";

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
      workspaceName: "Review Team Workspace",
      workspaceRootFolderId: "folder_workspace_root",
      projectId: "project_editor",
      projectName: "Editor Review",
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
  await seedMember(prisma, {
    userId: "user_alice",
    email: "alice@example.test",
    membershipId: "member_alice",
    workspaceId: reviewerWorkspaceId,
    displayName: "Alice",
    color: "#0969da",
    role: "owner",
  });
  await seedMember(prisma, {
    userId: "user_bob",
    email: "bob@example.test",
    membershipId: "member_bob",
    workspaceId: reviewerWorkspaceId,
    displayName: "Bob",
    color: "#1a7f37",
    role: "member",
  });
  await seedMember(prisma, {
    userId: "user_carol",
    email: "carol@example.test",
    membershipId: "member_carol",
    workspaceId: reviewerWorkspaceId,
    displayName: "Carol",
    color: "#8250df",
    role: "member",
  });
  await seedMember(prisma, {
    userId: "user_dana",
    email: "dana@example.test",
    membershipId: "member_dana",
    workspaceId: reviewerWorkspaceId,
    displayName: "Dana",
    color: "#bf3989",
    role: "member",
  });
}

async function seedReviewerDocuments(prisma: PrismaFixtureClient) {
  await prisma.document.upsert({
    where: { id: "document_review_plan" },
    update: {
      folderId: "folder_project_root",
      title: "Review Plan",
      state: "review",
      archivedAt: null,
      markdownBody:
        "# Review Plan\n\nThis document keeps product properties outside the Markdown body.",
      contentSource: "manualImport",
    },
    create: {
      id: "document_review_plan",
      folderId: reviewerProjectRootFolderId,
      title: "Review Plan",
      state: "review",
      markdownBodyRef: "documents/document_review_plan/current.md",
      markdownBody:
        "# Review Plan\n\nThis document keeps product properties outside the Markdown body.",
      contentSource: "manualImport",
    },
  });
  await prisma.document.upsert({
    where: { id: "document_decision_log" },
    update: {
      folderId: "folder_project_root",
      title: "Decision Log",
      state: "saved",
      archivedAt: null,
      markdownBody: "# Decision Log\n\nLinks to [Review Plan](./review-plan.md).",
      contentSource: "manualImport",
    },
    create: {
      id: "document_decision_log",
      folderId: reviewerProjectRootFolderId,
      title: "Decision Log",
      state: "saved",
      markdownBodyRef: "documents/document_decision_log/current.md",
      markdownBody: "# Decision Log\n\nLinks to [Review Plan](./review-plan.md).",
      contentSource: "manualImport",
    },
  });
  await prisma.documentProperty.upsert({
    where: { documentId_key: { documentId: "document_review_plan", key: "Status" } },
    update: { type: "status", value: { type: "status", value: "In Review" } },
    create: {
      documentId: "document_review_plan",
      key: "Status",
      type: "status",
      value: { type: "status", value: "In Review" },
    },
  });
  await prisma.documentProperty.upsert({
    where: { documentId_key: { documentId: "document_review_plan", key: "Owner" } },
    update: { type: "member", value: { type: "member", value: "member_alice" } },
    create: {
      documentId: "document_review_plan",
      key: "Owner",
      type: "member",
      value: { type: "member", value: "member_alice" },
    },
  });
  await prisma.linkEdge.upsert({
    where: {
      sourceDocumentId_targetDocumentId_markdownHref: {
        sourceDocumentId: "document_decision_log",
        targetDocumentId: "document_review_plan",
        markdownHref: "./review-plan.md",
      },
    },
    update: { preview: "Decision Log references the current review plan." },
    create: {
      sourceDocumentId: "document_decision_log",
      targetDocumentId: "document_review_plan",
      markdownHref: "./review-plan.md",
      preview: "Decision Log references the current review plan.",
    },
  });
}

function titleFromDocumentId(documentId: string) {
  return documentId
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
