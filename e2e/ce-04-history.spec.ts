import { createRequire } from "node:module";

import { expect, test, type Page } from "@playwright/test";

import {
  appendRichEditorLine,
  openReviewerSession,
  richMarkdownEditor,
  uniqueReviewDocumentId,
} from "./support/reviewer-session.js";

type PrismaFixtureClient = {
  workspace: {
    upsert(args: unknown): Promise<unknown>;
    update(args: unknown): Promise<unknown>;
  };
  folder: {
    upsert(args: unknown): Promise<unknown>;
  };
  user: {
    upsert(args: unknown): Promise<unknown>;
  };
  workspaceMembership: {
    upsert(args: unknown): Promise<unknown>;
  };
  document: {
    upsert(args: unknown): Promise<unknown>;
  };
  $disconnect(): Promise<void>;
};

const apiRequire = createRequire(new URL("../apps/api/package.json", import.meta.url));
const { PrismaClient } = apiRequire("@prisma/client") as {
  PrismaClient: new () => PrismaFixtureClient;
};

test("CE-04: reviewer can create and inspect a user-visible document revision", async ({
  page,
}) => {
  const documentId = uniqueReviewDocumentId("ce-04");
  await ensureCe04ProductFixture(documentId);

  await openReviewerSession(page, {
    member: "alice",
    documentId,
  });

  const editor = richMarkdownEditor(page);
  const revisionText = `Revision candidate text ${Date.now()}`;
  await expect(editor).toBeVisible();
  await appendRichEditorLine(page, editor, revisionText);
  await establishAliceSession(page);

  await page.getByTestId("publish-revision-button").click();
  await page.getByTestId("revision-message-input").fill("Capture review plan draft");
  await page.getByTestId("confirm-publish-revision-button").click();

  await expect(page.getByTestId("revision-history-list")).toContainText(
    "Capture review plan draft",
  );
  await page
    .getByTestId("revision-history-item")
    .filter({ hasText: "Capture review plan draft" })
    .click();
  await expect(page.getByTestId("revision-snapshot-viewer")).toContainText(revisionText);
});

async function establishAliceSession(page: Page) {
  const response = await page.request.post("http://127.0.0.1:4000/auth/session", {
    data: {
      email: "alice@example.test",
      workspaceId: "workspace_review",
    },
  });

  expect(response.ok(), await response.text()).toBeTruthy();
}

async function ensureCe04ProductFixture(documentId: string) {
  const prisma = new PrismaClient();

  try {
    await prisma.workspace.upsert({
      where: { id: "workspace_review" },
      update: { name: "Review Workspace" },
      create: { id: "workspace_review", name: "Review Workspace" },
    });
    await prisma.folder.upsert({
      where: { id: "folder_workspace_root" },
      update: { name: "Review Workspace", deletedAt: null },
      create: {
        id: "folder_workspace_root",
        workspaceId: "workspace_review",
        projectId: null,
        parentFolderId: null,
        name: "Review Workspace",
        kind: "workspaceRoot",
      },
    });
    await prisma.workspace.update({
      where: { id: "workspace_review" },
      data: { rootFolderId: "folder_workspace_root" },
    });
    await prisma.folder.upsert({
      where: { id: "folder_project_notes" },
      update: { deletedAt: null },
      create: {
        id: "folder_project_notes",
        workspaceId: "workspace_review",
        projectId: null,
        parentFolderId: "folder_workspace_root",
        name: "Notes",
        kind: "regular",
      },
    });
    await prisma.user.upsert({
      where: { email: "alice@example.test" },
      update: { name: "Alice Kim" },
      create: { id: "user_alice", email: "alice@example.test", name: "Alice Kim" },
    });
    await prisma.workspaceMembership.upsert({
      where: { id: "member_alice" },
      update: { workspaceId: "workspace_review", userId: "user_alice", role: "owner" },
      create: {
        id: "member_alice",
        userId: "user_alice",
        workspaceId: "workspace_review",
        displayName: "Alice",
        color: "#0969da",
        role: "owner",
      },
    });
    await prisma.document.upsert({
      where: { id: documentId },
      update: {
        folderId: "folder_project_notes",
        markdownBody: "# Review Plan",
        contentSource: "manualImport",
        archivedAt: null,
      },
      create: {
        id: documentId,
        folderId: "folder_project_notes",
        title: "Review Plan",
        state: "review",
        markdownBodyRef: `documents/${documentId}/current.md`,
        markdownBody: "# Review Plan",
        contentSource: "manualImport",
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
