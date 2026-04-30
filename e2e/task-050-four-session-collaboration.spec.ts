import { expect, test, type Browser, type Page } from "@playwright/test";

import {
  appendMarkdownLine,
  openReviewerSession,
  seededReviewDocumentId,
  type ReviewerMember,
} from "./support/reviewer-session.js";

type FourSession = Readonly<{
  member: ReviewerMember;
  page: Page;
}>;

test("TASK-050: four reviewer sessions converge on all collaborative edits", async ({
  browser,
}, testInfo) => {
  const sessions = await openFourSessions(browser);
  const runId = `${testInfo.workerIndex}-${Date.now()}`;
  const edits = sessions.map((session, index) => ({
    editor: session.page.getByTestId("collaborative-markdown-editor"),
    line: `${session.member} four-session edit ${runId}-${index}`,
    page: session.page,
  }));

  try {
    for (const edit of edits) {
      await expect(edit.editor).toBeVisible();
    }

    await Promise.all(edits.map((edit) => appendMarkdownLine(edit.page, edit.editor, edit.line)));

    for (const edit of edits) {
      for (const expected of edits) {
        await expect(edit.editor).toContainText(expected.line, { timeout: 10_000 });
      }
    }
  } finally {
    await Promise.all(sessions.map((session) => session.page.context().close()));
  }
});

async function openFourSessions(browser: Browser): Promise<readonly FourSession[]> {
  return Promise.all(
    (["alice", "bob", "carol", "dana"] as const).map(async (member) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await openReviewerSession(page, { member, documentId: seededReviewDocumentId });

      return { member, page };
    }),
  );
}
