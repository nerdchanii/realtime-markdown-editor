import { expect, test } from "@playwright/test";

import {
  appendMarkdownLine,
  openReviewerSession,
  seededReviewDocumentId,
} from "./support/reviewer-session.js";

test("CE-04: reviewer can create and inspect a user-visible document revision", async ({
  page,
}) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });

  const editor = page.getByTestId("collaborative-markdown-editor");
  const revisionText = `Revision candidate text ${Date.now()}`;
  await expect(editor).toBeVisible();
  await appendMarkdownLine(page, editor, revisionText);

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
