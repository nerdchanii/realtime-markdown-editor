import { expect, test } from "@playwright/test";

import { appendRichEditorLine, richMarkdownEditor } from "./support/reviewer-session.js";
import { createProductSession, ensureReviewerProductFixture } from "./support/product-fixtures.js";

test("TASK-045: reviewer workspace flow reaches product surfaces without hiding CE path", async ({
  page,
}) => {
  await ensureReviewerProductFixture();
  await createProductSession(page, "alice@example.test", "workspace_review");
  await page.goto("/?workspace=workspace_review");

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

  const editor = richMarkdownEditor(page);
  const reviewerLine = `TASK-045 reviewer flow ${Date.now()}`;
  const checkpointMessage = `TASK-045 integrated checkpoint ${Date.now()}`;
  await expect(editor).toBeVisible();
  await appendRichEditorLine(page, editor, reviewerLine);
  await expect(editor).toContainText(reviewerLine);

  await page.getByTestId("publish-revision-button").click();
  await page.getByTestId("revision-message-input").fill(checkpointMessage);
  await page.getByTestId("confirm-publish-revision-button").click();
  await page.getByTestId("revision-history-item").filter({ hasText: checkpointMessage }).click();
  await expect(page.getByTestId("revision-snapshot-viewer")).toContainText(reviewerLine);

  await page.getByTestId("document-publish-toggle").click();
  await page.getByTestId("markdown-export-menu-item").click();
  await page.getByTestId("markdown-export-button").click();
  await expect(page.getByTestId("markdown-export-filename")).toHaveText("review-plan.md");
  await expect(page.getByTestId("markdown-export-output")).toContainText("---");
  await expect(page.getByTestId("markdown-export-output")).toContainText('Status: "In Review"');
  await expect(page.getByTestId("markdown-export-output")).toContainText(reviewerLine);
});
