import { expect, test } from "@playwright/test";

import { openReviewerSession, seededReviewDocumentId } from "./support/reviewer-session.js";

test("CE-01: two members edit the same workspace document and converge without manual refresh", async ({
  browser,
}) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();

  await openReviewerSession(alicePage, { member: "alice", documentId: seededReviewDocumentId });
  await openReviewerSession(bobPage, { member: "bob", documentId: seededReviewDocumentId });

  const aliceEditor = alicePage.getByTestId("collaborative-markdown-editor");
  const bobEditor = bobPage.getByTestId("collaborative-markdown-editor");

  await expect(aliceEditor).toBeVisible();
  await expect(bobEditor).toBeVisible();

  await aliceEditor.click();
  await alicePage.keyboard.type("\nAlice concurrent line");
  await bobEditor.click();
  await bobPage.keyboard.type("\nBob concurrent line");

  await expect(aliceEditor).toContainText("Bob concurrent line");
  await expect(bobEditor).toContainText("Alice concurrent line");

  await alice.close();
  await bob.close();
});
