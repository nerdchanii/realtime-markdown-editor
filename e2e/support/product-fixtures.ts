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

const apiRequire = createRequire(new URL("../../apps/api/package.json", import.meta.url));
const { PrismaClient } = apiRequire("@prisma/client") as {
  PrismaClient: new () => PrismaFixtureClient;
};

export async function createProductSession(page: Page, email: string, workspaceId: string) {
  const response = await page.request.post(`${apiBaseUrl()}/auth/session`, {
    data: { email, workspaceId },
  });

  expect(response.ok(), await response.text()).toBeTruthy();
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
      workspaceId: "workspace_review",
      workspaceName: "Review Team Workspace",
      workspaceRootFolderId: "folder_workspace_root",
      projectId: "project_editor",
      projectName: "Editor Review",
      projectRootFolderId: "folder_project_root",
    });
    await seedMember(prisma, {
      userId: "user_alice",
      email: "alice@example.test",
      membershipId: "member_alice",
      workspaceId: "workspace_review",
      displayName: "Alice",
    });
    await seedReviewerDocuments(prisma);
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
  }>,
) {
  await prisma.user.upsert({
    where: { email: member.email },
    update: { name: member.displayName },
    create: { id: member.userId, email: member.email, name: member.displayName },
  });
  await prisma.workspaceMembership.upsert({
    where: { id: member.membershipId },
    update: {
      userId: member.userId,
      workspaceId: member.workspaceId,
      displayName: member.displayName,
      color: "#0969da",
      role: "owner",
    },
    create: {
      id: member.membershipId,
      userId: member.userId,
      workspaceId: member.workspaceId,
      displayName: member.displayName,
      color: "#0969da",
      role: "owner",
    },
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
      folderId: "folder_project_root",
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
      folderId: "folder_project_root",
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
