import { expect, test, type Page } from "@playwright/test";

import { openReviewerSession, uniqueReviewDocumentId } from "./support/reviewer-session.js";

test("Product: workspace settings rename workspace/project and create a project", async ({
  page,
}) => {
  const documentId = uniqueReviewDocumentId("workspace-lifecycle");
  const timestamp = Date.now();
  const workspaceName = `Review Workspace ${timestamp}`;
  const newProjectName = `Lifecycle Project ${timestamp}`;
  const renamedProjectName = `Editor Review ${timestamp}`;

  await openReviewerSession(page, { member: "alice", documentId });

  await expect(page.getByTestId("document-title")).toHaveValue(titleFromDocumentId(documentId));
  await page.getByLabel("Open profile menu").click();
  await page.getByRole("button", { name: "Workspace settings" }).click();

  await page.getByLabel("Workspace name").fill(workspaceName);
  await page.getByRole("button", { name: "Save workspace" }).click();

  await expect(page.getByText("Workspace saved.")).toBeVisible();
  await expect(page.getByLabel(workspaceName)).toBeVisible();

  await page.getByLabel("New project").fill(newProjectName);
  await page.getByRole("button", { name: "Create project" }).click();

  await expect(page.getByText("Project created.")).toBeVisible();
  await expect(page.getByRole("region", { name: newProjectName })).toBeVisible();

  await page.getByRole("button", { name: "Project", exact: true }).click();
  await page.getByLabel("Project name").fill(renamedProjectName);
  await page.getByRole("button", { name: "Save project" }).click();

  await expect(page.getByText("Project saved.")).toBeVisible();
  await expect(page.locator(".top-bar-chip").filter({ hasText: renamedProjectName })).toBeVisible();
  await expect(page.getByRole("region", { name: renamedProjectName })).toBeVisible();
});

test("Product: explorer moves documents and folders from normal navigation controls", async ({
  page,
}) => {
  const documentId = uniqueReviewDocumentId("workspace-move");
  const title = titleFromDocumentId(documentId);
  const timestamp = Date.now();
  const sourceFolder = `Move Source ${timestamp}`;
  const targetFolder = `Move Target ${timestamp}`;
  const sourceLabel = folderTargetLabel(sourceFolder);
  const targetLabel = folderTargetLabel(targetFolder);

  await openReviewerSession(page, { member: "alice", documentId });
  await expect(page.getByTestId("document-title")).toHaveValue(title);

  await createExplorerFolder(page, sourceFolder);
  await page.getByTestId(`workspace-document-${documentId}`).click();
  await createExplorerFolder(page, targetFolder);

  await page.getByLabel(`Move ${title}`).selectOption({ label: sourceLabel });
  const sourceFolderItem = folderItem(page, sourceFolder);
  await expect(sourceFolderItem.getByTestId(`workspace-document-${documentId}`)).toBeVisible();

  await page.getByLabel(`Move ${sourceFolder}`).selectOption({ label: targetLabel });
  await expect(
    folderItem(page, targetFolder).getByRole("button", { name: sourceFolder, exact: true }),
  ).toBeVisible();
  await expect(
    folderItem(page, targetFolder).getByTestId(`workspace-document-${documentId}`),
  ).toBeVisible();

  await folderItem(page, targetFolder)
    .getByRole("button", { name: targetFolder, exact: true })
    .hover();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByLabel(`Delete ${targetFolder}`).click();
  await expect(page.getByRole("button", { name: targetFolder, exact: true })).toBeHidden();
  await page.getByLabel("Open Trash").click();
  await expect(page.getByRole("region", { name: "Trash" })).toContainText(title);
});

test("Product: owner can archive the active project from settings", async ({ page }) => {
  const documentId = uniqueReviewDocumentId("project-archive");
  const title = titleFromDocumentId(documentId);
  await openReviewerSession(page, { member: "alice", documentId });
  await expect(page.getByTestId("document-title")).toHaveValue(title);

  await page.getByLabel("Open profile menu").click();
  await page.getByRole("button", { name: "Project settings" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Archive project" }).click();

  await expect(page.getByText("No workspace documents available.")).toBeVisible();
});

test("Product: owner can archive the workspace from settings", async ({ page }) => {
  const documentId = uniqueReviewDocumentId("workspace-archive");
  const title = titleFromDocumentId(documentId);
  await openReviewerSession(page, { member: "alice", documentId });
  await expect(page.getByTestId("document-title")).toHaveValue(title);

  await page.getByLabel("Open profile menu").click();
  await page.getByRole("button", { name: "Workspace settings" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Archive workspace" }).click();

  await expect(page.getByRole("heading", { name: "Create your first workspace" })).toBeVisible();
});

function titleFromDocumentId(documentId: string) {
  return documentId.replace(/[_-]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

async function createExplorerFolder(page: Page, name: string) {
  await page.getByLabel("New folder").click();
  const createdFolder = page.getByRole("button", { name: /^Untitled folder(?: \d+)?$/ }).last();
  await expect(createdFolder).toBeVisible();
  await createdFolder.dblclick();
  const renameInput = page.getByLabel(/^Rename Untitled folder(?: \d+)?$/).last();
  await expect(renameInput).toBeVisible();
  await renameInput.fill(name);
  await renameInput.press("Enter");
  await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
}

function folderItem(page: Page, name: string) {
  return page.locator('li[data-node-kind="regular"]').filter({
    has: page.getByRole("button", { name, exact: true }),
  });
}

function folderTargetLabel(folderName: string) {
  return `Atlas Knowledge Workspace / Product Architecture / Project root / ${folderName}`;
}
