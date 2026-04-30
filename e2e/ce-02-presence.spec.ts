import { expect, test } from "@playwright/test";

import {
  openReviewerSession,
  richMarkdownEditor,
  uniqueReviewDocumentId,
} from "./support/reviewer-session.js";

test("CE-02: remote cursor and selection show workspace member identity", async ({ browser }) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();
  const documentId = uniqueReviewDocumentId("ce-02");

  await openReviewerSession(alicePage, { member: "alice", documentId });
  await openReviewerSession(bobPage, { member: "bob", documentId });

  const bobEditor = richMarkdownEditor(bobPage);
  await expect(bobEditor).toBeVisible();
  await bobEditor.click();
  await bobPage.keyboard.down("Shift");
  await bobPage.keyboard.press("ArrowRight");
  await bobPage.keyboard.up("Shift");

  const bobCursor = alicePage.getByTestId("presence-cursor-bob").first();
  const bobSelection = alicePage.getByTestId("presence-selection-bob").first();

  await expect(bobCursor).toBeVisible();
  await expect(bobSelection).toBeVisible();
  await expect(bobCursor).toContainText("Bob");

  await alice.close();
  await bob.close();
});
