import { expect, test } from "@playwright/test";

import {
  addMarkdownLine,
  expectMarkdownContains,
  markdownSurface,
  openCeDocument,
  waitForCollaborationReady,
} from "./support/ce-acceptance.js";
import { uniqueReviewDocumentId } from "./support/reviewer-session.js";

// skip: token 을 보내지 않는 legacy web provider 라 협업 서버가 연결을 거부한다. editor provider 슬라이스에서 대체한다. Refs #19
test.skip("CE-03: offline local edits merge with remote state after reconnect", async ({
  browser,
}) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();
  const documentId = uniqueReviewDocumentId("ce-03");

  await openCeDocument(alicePage, { member: "alice", documentId });
  await openCeDocument(bobPage, { member: "bob", documentId });

  const aliceEditor = markdownSurface(alicePage);
  const bobEditor = markdownSurface(bobPage);
  await expect(aliceEditor).toBeVisible();
  await expect(bobEditor).toBeVisible();
  await waitForCollaborationReady(alicePage);
  await waitForCollaborationReady(bobPage);

  const aliceLine = `Alice offline edit ${Date.now()}`;
  const bobLine = `Bob online edit ${Date.now()}`;

  await alice.setOffline(true);
  await addMarkdownLine(alicePage, aliceLine);
  await addMarkdownLine(bobPage, bobLine);

  await alice.setOffline(false);

  await expectMarkdownContains(alicePage, bobLine);
  await expectMarkdownContains(bobPage, aliceLine);

  await alice.close();
  await bob.close();
});

// skip: token 을 보내지 않는 legacy web provider 라 협업 서버가 연결을 거부한다. editor provider 슬라이스에서 대체한다. Refs #19
test.skip("CE-03: offline draft recovers from IndexedDB after tab close and reconnect merge", async ({
  browser,
}) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();
  const documentId = uniqueReviewDocumentId("ce-03-indexeddb");

  try {
    await openCeDocument(alicePage, { member: "alice", documentId });
    await openCeDocument(bobPage, { member: "bob", documentId });

    const aliceEditor = markdownSurface(alicePage);
    const bobEditor = markdownSurface(bobPage);
    await expect(aliceEditor).toBeVisible();
    await expect(bobEditor).toBeVisible();
    await waitForCollaborationReady(alicePage);
    await waitForCollaborationReady(bobPage);

    const aliceLine = `Alice recovered offline draft ${Date.now()}`;
    const bobLine = `Bob remote edit before Alice reconnect ${Date.now()}`;

    await alice.setOffline(true);
    await addMarkdownLine(alicePage, aliceLine);
    await expect(aliceEditor).toContainText(aliceLine);
    await alicePage.close();

    await addMarkdownLine(bobPage, bobLine);
    await expect(bobEditor).toContainText(bobLine);

    await alice.setOffline(false);
    const reopenedAlicePage = await alice.newPage();
    await openCeDocument(reopenedAlicePage, { member: "alice", documentId });

    const reopenedAliceEditor = markdownSurface(reopenedAlicePage);
    await expect(reopenedAliceEditor).toContainText(aliceLine, { timeout: 10_000 });
    await expect(reopenedAliceEditor).toContainText(bobLine, { timeout: 10_000 });
    await expect(bobEditor).toContainText(aliceLine, { timeout: 10_000 });
  } finally {
    await Promise.allSettled([alice.close(), bob.close()]);
  }
});
