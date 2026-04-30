import { expect, test } from "@playwright/test";

import { appendMarkdownLine } from "./support/reviewer-session.js";

test("TASK-045: reviewer workspace flow reaches product surfaces without hiding CE path", async ({
  page,
}) => {
  await page.goto("/?member=alice");

  const workspace = page.getByLabel("Workspace navigation");
  await expect(workspace).toBeVisible();

  const reviewPlanNode = page.getByTestId("workspace-document-document_review_plan");
  await reviewPlanNode.click();
  await expect(reviewPlanNode).toHaveAttribute("aria-current", "page");
  await expect(workspace).toHaveAttribute("data-selected-document-id", "document_review_plan");

  await expect(page.getByTestId("document-title")).toHaveText("Review Plan");
  await expect(page.getByTestId("document-properties").getByLabel("Status")).toHaveValue(
    "In Review",
  );
  await expect(page.getByTestId("document-properties").getByLabel("Owner")).toHaveValue("Alice");
  await expect(page.getByTestId("document-backlinks")).toContainText("Decision Log");

  const editor = page.getByTestId("collaborative-markdown-editor");
  const reviewerLine = `TASK-045 reviewer flow ${Date.now()}`;
  await expect(editor).toBeVisible();
  await appendMarkdownLine(page, editor, reviewerLine);

  await page.getByRole("button", { name: "Rich" }).click();
  await expect(page.getByTestId("editor-rich-view")).toBeVisible();
  await page.getByRole("button", { name: "Preview" }).click();
  await expect(page.getByTestId("editor-preview-view")).toContainText(reviewerLine);
  await page.getByRole("button", { name: "Split" }).click();
  await expect(page.getByTestId("editor-split-view")).toBeVisible();
  await expect(editor).toContainText(reviewerLine);

  await page.getByTestId("publish-revision-button").click();
  await page.getByTestId("revision-message-input").fill("TASK-045 integrated checkpoint");
  await page.getByTestId("confirm-publish-revision-button").click();
  await page
    .getByTestId("revision-history-item")
    .filter({ hasText: "TASK-045 integrated checkpoint" })
    .click();
  await expect(page.getByTestId("revision-snapshot-viewer")).toContainText(reviewerLine);

  await page.getByTestId("markdown-export-button").click();
  await expect(page.getByTestId("markdown-export-filename")).toHaveText("review-plan.md");
  await expect(page.getByTestId("markdown-export-output")).toContainText("---");
  await expect(page.getByTestId("markdown-export-output")).toContainText('Status: "In Review"');
  await expect(page.getByTestId("markdown-export-output")).toContainText(reviewerLine);
});
