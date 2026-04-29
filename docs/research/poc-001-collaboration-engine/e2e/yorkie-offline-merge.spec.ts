import { expect, test } from '@playwright/test';
import {
  OFFLINE_TOKEN,
  ONLINE_TOKEN,
  appendBelowRichAnchor,
  closePairedPages,
  expectBothTokens,
  isTcpPortOpen,
  makeDocumentKey,
  openPairedPages,
  waitForSeededEditor,
} from './offline-merge-helpers';

test('Yorkie/ProseMirror preserves offline and online edits after reconnect', async ({ browser }) => {
  const yorkieServerAvailable = await isTcpPortOpen(8080);

  test.skip(
    !yorkieServerAvailable,
    'Yorkie E2E requires a local Yorkie server on localhost:8080. Start it with `yorkie server`.',
  );
  const documentKey = makeDocumentKey('yorkie');
  const aliceUrl = `http://127.0.0.1:5175/?user=alice&doc=${documentKey}&mode=rich`;
  const bobUrl = `http://127.0.0.1:5175/?user=bob&doc=${documentKey}&mode=rich`;
  const { aliceContext, bobContext, alicePage, bobPage } = await openPairedPages({
    browser,
    aliceUrl,
    bobUrl,
  });

  try {
    await waitForSeededEditor(alicePage);
    await waitForSeededEditor(bobPage);
    await expect(alicePage.locator('[data-poc-status="connection"]')).toContainText('online');
    await expect(bobPage.locator('[data-poc-status="connection"]')).toContainText('online');

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
