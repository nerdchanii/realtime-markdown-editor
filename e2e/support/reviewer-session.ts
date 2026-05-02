import { expect, type Locator, type Page } from "@playwright/test";

import {
  createProductSession,
  ensureReviewerProductDocument,
  ensureReviewerProductFixture,
  reviewerWorkspaceId,
} from "./product-fixtures.js";

export type ReviewerMember = "alice" | "bob" | "carol" | "dana";

export type ReviewerSession = Readonly<{
  member: ReviewerMember;
  documentId: string;
}>;

export async function openReviewerSession(page: Page, session: ReviewerSession) {
  await ensureReviewerProductFixture();
  await ensureReviewerProductDocument(normalizeDocumentId(session.documentId));
  await createProductSession(page, `${session.member}@example.test`, reviewerWorkspaceId);

  const params = new URLSearchParams({
    workspace: reviewerWorkspaceId,
    document: normalizeDocumentId(session.documentId),
  });

  await page.goto(`/?${params.toString()}`);
}

export const seededReviewDocumentId = "document_review_plan";

export function uniqueReviewDocumentId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function richMarkdownEditor(page: Page) {
  return page.getByTestId("rich-markdown-editor");
}

export async function createLocalMarkdownDocument(page: Page, title: string) {
  await page.getByLabel("New document").click();
  const titleInput = page.getByLabel("Document title");
  await expect(titleInput).toBeVisible();
  await expect(titleInput).toHaveValue(/Untitled document/);
  await titleInput.fill(title);
  await expect(titleInput).toHaveValue(title);
  await titleInput.blur();
}

export async function appendRichEditorLine(page: Page, editor: Locator, line: string) {
  await expect(editor).toBeVisible();
  await editor.click({ force: true });
  await page.keyboard.insertText(`\n${line}`);
}

function normalizeDocumentId(documentId: string) {
  return documentId === "seed-review-plan" ? seededReviewDocumentId : documentId;
}
