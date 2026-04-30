import { expect, test } from "@playwright/test";

import {
  appendMarkdownLine,
  openReviewerSession,
  seededReviewDocumentId,
} from "./support/reviewer-session.js";

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

  const aliceLine = `Alice concurrent line ${Date.now()}`;
  const bobLine = `Bob concurrent line ${Date.now()}`;

  await appendMarkdownLine(alicePage, aliceEditor, aliceLine);
  await appendMarkdownLine(bobPage, bobEditor, bobLine);

  await expect(aliceEditor).toContainText(bobLine);
  await expect(bobEditor).toContainText(aliceLine);

  await alice.close();
  await bob.close();
});
