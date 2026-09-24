import { expect, test } from "@playwright/test";

import {
  appendRichEditorLine,
  openReviewerSession,
  richMarkdownEditor,
  uniqueReviewDocumentId,
} from "./support/reviewer-session.js";

test("Product: document and checkpoint creation become visible to another active member", async ({
  browser,
}) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();
  const documentId = uniqueReviewDocumentId("collab-visibility");
  const checkpointLine = `Collaborative checkpoint visibility ${Date.now()}`;

  await openReviewerSession(alicePage, { member: "alice", documentId });
  await openReviewerSession(bobPage, { member: "bob", documentId });

  await appendRichEditorLine(alicePage, richMarkdownEditor(alicePage), checkpointLine);
  await alicePage.getByLabel("Save document checkpoint").click();

  await expect(
    bobPage
      .getByTestId("history-slot")
      .getByRole("button")
      .filter({ hasText: "Manual checkpoint" }),
  ).toBeVisible({ timeout: 10_000 });
  await bobPage
    .getByTestId("history-slot")
    .getByRole("button")
    .filter({ hasText: "Manual checkpoint" })
    .first()
    .click();
  await expect(richMarkdownEditor(bobPage)).toContainText(checkpointLine);
  await bobPage.getByText("Back to current document").click();

  const originalTitle = await alicePage.getByTestId("document-title").inputValue();
  await alicePage.getByLabel("New document").click();
  await expect
    .poll(() => alicePage.getByTestId("document-title").inputValue())
    .not.toBe(originalTitle);
  const createdDocumentTitle = await alicePage.getByTestId("document-title").inputValue();
  await expect(alicePage.getByTestId("document-title")).toHaveValue(createdDocumentTitle);
  await expect(
    bobPage.getByLabel("Workspace navigation").getByRole("button", { name: createdDocumentTitle }),
  ).toBeVisible({ timeout: 10_000 });

  await alice.close();
  await bob.close();
});
