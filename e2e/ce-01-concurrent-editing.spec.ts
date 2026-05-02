import { expect, test } from "@playwright/test";

import {
  addMarkdownLine,
  expectMarkdownContains,
  markdownSurface,
  openCeDocument,
  waitForCollaborationReady,
} from "./support/ce-acceptance.js";
import { uniqueReviewDocumentId } from "./support/reviewer-session.js";

test("CE-01: two members edit the same workspace document and converge without manual refresh", async ({
  browser,
}) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();
  const documentId = uniqueReviewDocumentId("ce-01");

  await openCeDocument(alicePage, { member: "alice", documentId });
  await openCeDocument(bobPage, { member: "bob", documentId });

  await expect(markdownSurface(alicePage)).toBeVisible();
  await expect(markdownSurface(bobPage)).toBeVisible();
  await waitForCollaborationReady(alicePage);
  await waitForCollaborationReady(bobPage);

  const aliceLine = `Alice concurrent line ${Date.now()}`;
  const bobLine = `Bob concurrent line ${Date.now()}`;

  await addMarkdownLine(alicePage, aliceLine);
  await addMarkdownLine(bobPage, bobLine);

  await expectMarkdownContains(alicePage, bobLine);
  await expectMarkdownContains(bobPage, aliceLine);

  await alice.close();
  await bob.close();
});
