import { expect, test, type Browser, type Page } from "@playwright/test";

import {
  appendRichEditorLine,
  openReviewerSession,
  richMarkdownEditor,
  uniqueReviewDocumentId,
  type ReviewerMember,
} from "./support/reviewer-session.js";

type FourSession = Readonly<{
  member: ReviewerMember;
  page: Page;
}>;

// skip: token 을 보내지 않는 legacy web provider 라 협업 서버가 연결을 거부한다. editor provider 슬라이스에서 대체한다. Refs #19
test.skip("TASK-050: four reviewer sessions converge on all collaborative edits", async ({
  browser,
}, testInfo) => {
  const runId = `${testInfo.workerIndex}-${Date.now()}`;
  const documentId = uniqueReviewDocumentId("task-050");
  const sessions = await openFourSessions(browser, documentId);
  const edits = sessions.map((session, index) => ({
    editor: richMarkdownEditor(session.page),
    line: `${session.member} four-session edit ${runId}-${index}`,
    page: session.page,
  }));

  try {
    for (const edit of edits) {
      await expect(edit.editor).toBeVisible();
    }

    await Promise.all(edits.map((edit) => appendRichEditorLine(edit.page, edit.editor, edit.line)));

    for (const edit of edits) {
      for (const expected of edits) {
        await expect(edit.editor).toContainText(expected.line, { timeout: 10_000 });
      }
    }
  } finally {
    await Promise.all(sessions.map((session) => session.page.context().close()));
  }
});

async function openFourSessions(
  browser: Browser,
  documentId: string,
): Promise<readonly FourSession[]> {
  return Promise.all(
    (["alice", "bob", "carol", "dana"] as const).map(async (member) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await openReviewerSession(page, { member, documentId });

      return { member, page };
    }),
  );
}
