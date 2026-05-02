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
  await expect(alicePage.getByText(/^Synced$/i).last()).toBeVisible({ timeout: 10_000 });
  await expect(bobPage.getByText(/^Synced$/i).last()).toBeVisible({ timeout: 10_000 });
  await bobEditor.click();
  await bobPage.keyboard.insertText("presence");
  await bobPage.keyboard.down("Shift");
  await bobPage.keyboard.press("ArrowLeft");
  await bobPage.keyboard.up("Shift");

  const aliceEditor = richMarkdownEditor(alicePage);
  const bobCursor = aliceEditor.locator(".collaboration-carets__caret", { hasText: "Bob" }).first();
  const bobSelection = aliceEditor.locator(".ProseMirror-yjs-selection").first();
  const bobCursorLabel = bobCursor.locator(".collaboration-carets__label");

  await expect(bobCursor).toBeVisible({ timeout: 10_000 });
  await expect(bobSelection).toBeVisible({ timeout: 10_000 });
  await expect(bobCursorLabel).toHaveText("Bob", { timeout: 10_000 });
  await expect(bobCursor).toHaveCSS("border-left-width", "2px");

  await alice.close();
  await bob.close();
});
