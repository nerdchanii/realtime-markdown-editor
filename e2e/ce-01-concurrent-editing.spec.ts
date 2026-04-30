import { expect, test } from "@playwright/test";

import {
  appendRichEditorLine,
  openReviewerSession,
  richMarkdownEditor,
  uniqueReviewDocumentId,
} from "./support/reviewer-session.js";

test("CE-01: two members edit the same workspace document and converge without manual refresh", async ({
  browser,
}) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();
  const documentId = uniqueReviewDocumentId("ce-01");

  await openReviewerSession(alicePage, { member: "alice", documentId });
  await openReviewerSession(bobPage, { member: "bob", documentId });

  const aliceEditor = richMarkdownEditor(alicePage);
  const bobEditor = richMarkdownEditor(bobPage);

  await expect(aliceEditor).toBeVisible();
  await expect(bobEditor).toBeVisible();

  const aliceLine = `Alice concurrent line ${Date.now()}`;
  const bobLine = `Bob concurrent line ${Date.now()}`;

  await appendRichEditorLine(alicePage, aliceEditor, aliceLine);
  await appendRichEditorLine(bobPage, bobEditor, bobLine);

  await expect(aliceEditor).toContainText(bobLine);
  await expect(bobEditor).toContainText(aliceLine);

  await alice.close();
  await bob.close();
});
