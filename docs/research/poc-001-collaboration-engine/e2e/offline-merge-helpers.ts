import { expect, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { createConnection } from 'node:net';

declare global {
  interface Window {
    __pocInsertTextAfterAnchor?: (anchorText: string, text: string) => boolean;
  }
}

export const OFFLINE_TOKEN = 'OFFLINE_ALICE_TOKEN';
export const ONLINE_TOKEN = 'ONLINE_BOB_TOKEN';

export type Candidate = 'tiptap' | 'yorkie';

export async function isTcpPortOpen(port: number, host = '127.0.0.1') {
  return new Promise<boolean>((resolve) => {
    const socket = createConnection({ host, port });
    const finish = (result: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(1_000);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

export function makeDocumentKey(candidate: Candidate) {
  return `e2e-${candidate}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function openPairedPages(input: {
  browser: Browser;
  aliceUrl: string;
  bobUrl: string;
}) {
  const aliceContext = await input.browser.newContext();
  const bobContext = await input.browser.newContext();
  const alicePage = await aliceContext.newPage();
  const bobPage = await bobContext.newPage();

  await alicePage.goto(input.aliceUrl);
  await bobPage.goto(input.bobUrl);

  return {
    aliceContext,
    bobContext,
    alicePage,
    bobPage,
  };
}

export async function closePairedPages(contexts: BrowserContext[]) {
  await Promise.all(contexts.map((context) => context.close()));
}

export async function waitForSeededEditor(page: Page) {
  await expect(page.locator('[data-poc-rich-editor]')).toContainText('Launch Readiness Brief');
}

export async function appendInRichEditor(page: Page, text: string) {
  const editor = page.locator('[data-poc-rich-editor] [contenteditable="true"]').first();
  await expect(editor).toBeVisible();
  await editor.click();
  await editor.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
  await page.keyboard.type(`\n\n${text}`);
}

export async function appendBelowRichAnchor(page: Page, anchorText: string, text: string) {
  const editor = page.locator('[data-poc-rich-editor] [contenteditable="true"]').first();
  await expect(editor).toBeVisible();

  const insertedViaHarness = await page.evaluate(
    ([targetAnchor, targetText]) => window.__pocInsertTextAfterAnchor?.(targetAnchor, targetText) ?? false,
    [anchorText, text],
  );

  if (insertedViaHarness) {
    await expect(editor).toContainText(text);
    return;
  }

  await editor.getByText(anchorText).click();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type(text);
  await expect(editor).toContainText(text);
}

export async function appendInSourceEditor(page: Page, text: string) {
  const source = page.locator('[data-poc-editor-source]').first();
  await expect(source).toBeVisible();
  const current = await source.inputValue();
  await source.fill(`${current}\n\n${text}`);
  await expect(source).toHaveValue(new RegExp(text));
}

export async function readMarkdownSource(page: Page) {
  const source = page.locator('[data-poc-editor-source]').first();

  if (!(await source.isVisible())) {
    await page.getByRole('tab', { name: /source/i }).click();
  }

  await expect(source).toBeVisible();
  return source.inputValue();
}

export async function expectBothTokens(page: Page) {
  await expect
    .poll(() => readMarkdownSource(page), {
      timeout: 30_000,
      intervals: [500, 1_000, 2_000],
    })
    .toContain(OFFLINE_TOKEN);

  await expect
    .poll(() => readMarkdownSource(page), {
      timeout: 30_000,
      intervals: [500, 1_000, 2_000],
    })
    .toContain(ONLINE_TOKEN);
}
