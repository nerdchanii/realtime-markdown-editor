import { expect, test } from "@playwright/test";

import { openReviewerSession, seededReviewDocumentId } from "./support/reviewer-session.js";

test("CE-03: offline local edits merge with remote state after reconnect", async ({ browser }) => {
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

  await alice.setOffline(true);
  await aliceEditor.click();
  await alicePage.keyboard.type("\nAlice offline edit");

  await bobEditor.click();
  await bobPage.keyboard.type("\nBob online edit");

  await alice.setOffline(false);

  await expect(aliceEditor).toContainText("Bob online edit");
  await expect(bobEditor).toContainText("Alice offline edit");

  await alice.close();
  await bob.close();
});
