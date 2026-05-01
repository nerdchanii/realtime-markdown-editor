import { expect, test } from "@playwright/test";

import {
  appendRichEditorLine,
  openReviewerSession,
  richMarkdownEditor,
  uniqueReviewDocumentId,
} from "./support/reviewer-session.js";

test("CE-03: offline local edits merge with remote state after reconnect", async ({ browser }) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();
  const documentId = uniqueReviewDocumentId("ce-03");

  await openReviewerSession(alicePage, { member: "alice", documentId });
  await openReviewerSession(bobPage, { member: "bob", documentId });

  const aliceEditor = richMarkdownEditor(alicePage);
  const bobEditor = richMarkdownEditor(bobPage);
  await expect(aliceEditor).toBeVisible();
  await expect(bobEditor).toBeVisible();

  const aliceLine = `Alice offline edit ${Date.now()}`;
  const bobLine = `Bob online edit ${Date.now()}`;

  await alice.setOffline(true);
  await appendRichEditorLine(alicePage, aliceEditor, aliceLine);
  await appendRichEditorLine(bobPage, bobEditor, bobLine);

  await alice.setOffline(false);

  await expect(aliceEditor).toContainText(bobLine);
  await expect(bobEditor).toContainText(aliceLine);

  await alice.close();
  await bob.close();
});

test("CE-03: offline draft recovers from IndexedDB after tab close and reconnect merge", async ({
  browser,
}) => {
  const alice = await browser.newContext();
  const bob = await browser.newContext();
  const alicePage = await alice.newPage();
  const bobPage = await bob.newPage();
  const documentId = uniqueReviewDocumentId("ce-03-indexeddb");

  try {
    await openReviewerSession(alicePage, { member: "alice", documentId });
    await openReviewerSession(bobPage, { member: "bob", documentId });

    const aliceEditor = richMarkdownEditor(alicePage);
    const bobEditor = richMarkdownEditor(bobPage);
    await expect(aliceEditor).toBeVisible();
    await expect(bobEditor).toBeVisible();

    const aliceLine = `Alice recovered offline draft ${Date.now()}`;
    const bobLine = `Bob remote edit before Alice reconnect ${Date.now()}`;

    await alice.setOffline(true);
    await appendRichEditorLine(alicePage, aliceEditor, aliceLine);
    await expect(aliceEditor).toContainText(aliceLine);
    await alicePage.close();

    await appendRichEditorLine(bobPage, bobEditor, bobLine);
    await expect(bobEditor).toContainText(bobLine);

    await alice.setOffline(false);
    const reopenedAlicePage = await alice.newPage();
    await openReviewerSession(reopenedAlicePage, { member: "alice", documentId });

    const reopenedAliceEditor = richMarkdownEditor(reopenedAlicePage);
    await expect(reopenedAliceEditor).toContainText(aliceLine, { timeout: 10_000 });
    await expect(reopenedAliceEditor).toContainText(bobLine, { timeout: 10_000 });
    await expect(bobEditor).toContainText(aliceLine, { timeout: 10_000 });
  } finally {
    await Promise.allSettled([alice.close(), bob.close()]);
  }
});
