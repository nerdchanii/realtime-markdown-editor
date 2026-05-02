import { expect, test } from "@playwright/test";

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

function titleFromDocumentId(documentId: string) {
  return documentId.replace(/[_-]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
