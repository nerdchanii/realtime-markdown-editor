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

  await expect(page.getByTestId("document-title")).toHaveValue("Architecture Overview");
  await expect(page.getByTestId("document-properties").getByLabel("Status value")).toHaveValue(
    "In Review",
  );
  await expect(page.getByTestId("document-properties").getByLabel("Owner value")).toHaveValue(
    "Alice",
  );
  const editor = richMarkdownEditor(page);
  const reviewerLine = `TASK-045 reviewer flow ${Date.now()}`;
  await expect(editor).toBeVisible();
  await appendRichEditorLine(page, editor, reviewerLine);
  await expect(editor).toContainText(reviewerLine);
});
