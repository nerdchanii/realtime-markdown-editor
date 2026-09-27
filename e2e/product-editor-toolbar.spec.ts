import { expect, test } from "@playwright/test";

import { waitForCollaborationReady } from "./support/ce-acceptance.js";
import {
  createLocalMarkdownDocument,
  openReviewerSession,
  richMarkdownEditor,
  seededReviewDocumentId,
  uniqueReviewDocumentId,
} from "./support/reviewer-session.js";

test("Product: editor toolbar exposes dense Markdown controls on the collaboration editor", async ({
  page,
}) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });
  await createLocalMarkdownDocument(page, `Toolbar controls ${Date.now()}`);

  await expect(page.getByTestId("editor-format-toolbar")).toBeVisible();
  await expect(page.getByTestId("editor-undo-button")).toBeVisible();
  await expect(page.getByTestId("editor-link-button")).toBeVisible();
  await expect(page.getByTestId("editor-task-button")).toBeVisible();
});

// skip: token 을 보내지 않는 legacy web provider 라 협업 서버가 연결을 거부한다. editor provider 슬라이스에서 대체한다. Refs #19
test.skip("Product: toolbar undo and redo operate on the real editor content", async ({ page }) => {
  await openReviewerSession(page, {
    member: "alice",
    documentId: uniqueReviewDocumentId("toolbar-undo-redo"),
  });

  const editor = richMarkdownEditor(page);
  const undoRedoText = `undo redo content ${Date.now()}`;

  await waitForCollaborationReady(page);
  await expect(page.getByTestId("editor-undo-button")).toBeVisible();
  await editor.click();
  await page.keyboard.insertText(undoRedoText);
  await expect(editor).toContainText(undoRedoText);

  await page.getByTestId("editor-undo-button").click();
  await expect(editor).not.toContainText(undoRedoText);

  await page.getByTestId("editor-redo-button").click();
  await expect(editor).toContainText(undoRedoText);
});
