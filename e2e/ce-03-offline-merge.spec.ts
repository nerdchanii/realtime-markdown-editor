import { expect, test } from "@playwright/test";

import {
  appendMarkdownLine,
  openReviewerSession,
  seededReviewDocumentId,
} from "./support/reviewer-session.js";

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

  const aliceLine = `Alice offline edit ${Date.now()}`;
  const bobLine = `Bob online edit ${Date.now()}`;

  await alice.setOffline(true);
  await appendMarkdownLine(alicePage, aliceEditor, aliceLine);
  await appendMarkdownLine(bobPage, bobEditor, bobLine);

  await alice.setOffline(false);

  await expect(aliceEditor).toContainText(bobLine);
  await expect(bobEditor).toContainText(aliceLine);

  await alice.close();
  await bob.close();
});
