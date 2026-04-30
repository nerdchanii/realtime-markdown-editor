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
  await expect(alicePage.getByTestId("sync-status")).toContainText("synced", {
    ignoreCase: true,
    timeout: 10_000,
  });
  await expect(bobPage.getByTestId("sync-status")).toContainText("synced", {
    ignoreCase: true,
    timeout: 10_000,
  });
  await bobEditor.click();
  await bobPage.keyboard.insertText("presence");
  await bobPage.keyboard.down("Shift");
  await bobPage.keyboard.press("ArrowLeft");
  await bobPage.keyboard.up("Shift");

  const bobCursor = alicePage.getByTestId("presence-cursor-bob").first();
  const bobSelection = alicePage.getByTestId("presence-selection-bob").first();

  await expect(bobCursor).toBeVisible({ timeout: 10_000 });
  await expect(bobSelection).toBeVisible({ timeout: 10_000 });
  await expect(bobCursor).toContainText("Bob", { timeout: 10_000 });

  await alice.close();
  await bob.close();
});
