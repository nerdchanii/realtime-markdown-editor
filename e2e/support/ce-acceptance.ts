import { readFile } from "node:fs/promises";

import { expect, type Page } from "@playwright/test";

import {
  appendRichEditorLine,
  createLocalMarkdownDocument,
  openReviewerSession,
  richMarkdownEditor,
  type ReviewerMember,
} from "./reviewer-session.js";

export type CeSession = Readonly<{
  member: ReviewerMember;
  documentId: string;
}>;

export async function openCeDocument(page: Page, session: CeSession) {
  await openReviewerSession(page, session);
  await expect(markdownSurface(page)).toBeVisible();
}

export function markdownSurface(page: Page) {
  return richMarkdownEditor(page);
}

export async function waitForCollaborationReady(page: Page) {
  await expect(page.getByText(/^Synced$/i).last()).toBeVisible({ timeout: 10_000 });
}

export async function addMarkdownLine(page: Page, line: string) {
  await appendRichEditorLine(page, markdownSurface(page), line);
}

export async function expectMarkdownContains(page: Page, text: string) {
  await expect(markdownSurface(page)).toContainText(text, { timeout: 10_000 });
}

export async function createProductMarkdownDocument(page: Page, title: string) {
  await createLocalMarkdownDocument(page, title);
  await expect(markdownSurface(page)).toBeVisible();
}

export async function createUserCheckpoint(page: Page, message: string) {
  await page.getByLabel("Save document checkpoint").click();
  await expect(page.getByLabel("Document checkpoint saved")).toBeVisible();
  await expect(page.getByLabel("History inspector")).toContainText(message);
}

export async function openCheckpointSnapshot(page: Page, message: string) {
  await page
    .getByRole("button", { name: new RegExp(message) })
    .first()
    .click();
  return markdownSurface(page);
}

export async function exportCurrentMarkdown(page: Page): Promise<string> {
  const downloadPromise = page.waitForEvent("download");
  await page.getByLabel("Document actions").click();
  await page.getByRole("menuitem", { name: "Export Markdown" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (!path) return "";
  return readFile(path, "utf8");
}
