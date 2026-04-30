import type { Locator, Page } from "@playwright/test";

export type ReviewerMember = "alice" | "bob" | "carol" | "dana";

export type ReviewerSession = Readonly<{
  member: ReviewerMember;
  documentId: string;
}>;

export async function openReviewerSession(page: Page, session: ReviewerSession) {
  const params = new URLSearchParams({
    member: session.member,
    document: session.documentId,
  });

  await page.goto(`/?${params.toString()}`);
}

export const seededReviewDocumentId = "seed-review-plan";

export async function appendMarkdownLine(page: Page, editor: Locator, line: string) {
  await editor.click();
  await page.keyboard.insertText(`\n${line}`);
}
