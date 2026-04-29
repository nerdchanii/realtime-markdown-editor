import type { Page } from "@playwright/test";

export type ReviewerMember = "alice" | "bob";

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
