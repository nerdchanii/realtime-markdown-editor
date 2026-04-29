import { expect, test } from '@playwright/test';
import {
  OFFLINE_TOKEN,
  ONLINE_TOKEN,
  appendBelowRichAnchor,
  closePairedPages,
  expectBothTokens,
  makeDocumentKey,
  openPairedPages,
  waitForSeededEditor,
} from './offline-merge-helpers';

test('Tiptap/Yjs/Hocuspocus preserves offline and online edits after reconnect', async ({ browser }) => {
  const documentName = makeDocumentKey('tiptap');
  const aliceUrl = `http://127.0.0.1:5174/?user=alice&document=${documentName}`;
  const bobUrl = `http://127.0.0.1:5174/?user=bob&document=${documentName}`;
  const { aliceContext, bobContext, alicePage, bobPage } = await openPairedPages({
    browser,
    aliceUrl,
    bobUrl,
  });

  try {
    await waitForSeededEditor(alicePage);
    await waitForSeededEditor(bobPage);
    await expect(alicePage.locator('[data-poc-connection-status]')).toHaveAttribute(
      'data-poc-connection-status',
      'connected',
    );
    await expect(bobPage.locator('[data-poc-connection-status]')).toHaveAttribute(
      'data-poc-connection-status',
      'connected',
    );

    await aliceContext.setOffline(true);
    await appendBelowRichAnchor(alicePage, 'Local offline anchor', OFFLINE_TOKEN);
    await appendBelowRichAnchor(bobPage, 'Remote online anchor', ONLINE_TOKEN);

    await aliceContext.setOffline(false);

    await expectBothTokens(alicePage);
    await expectBothTokens(bobPage);
  } finally {
    await closePairedPages([aliceContext, bobContext]);
  }
});
