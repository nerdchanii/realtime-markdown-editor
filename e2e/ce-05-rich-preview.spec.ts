import { expect, test } from "@playwright/test";

import {
  createLocalMarkdownDocument,
  openReviewerSession,
  richMarkdownEditor,
  seededReviewDocumentId,
  uniqueReviewDocumentId,
} from "./support/reviewer-session.js";

test("CE-05: TipTap rich editor renders Markdown authoring shortcuts in the editable surface", async ({
  page,
}) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });
  await createLocalMarkdownDocument(page, `CE 05 shortcuts ${Date.now()}`);

  const editor = richMarkdownEditor(page);
  const previewHeading = `Rich heading ${Date.now()}`;
  await expect(editor).toBeVisible();
  await editor.click();
  await page.keyboard.press(process.platform === "darwin" ? "Meta+End" : "Control+End");
  await page.keyboard.press("Enter");
  await page.keyboard.type(`# ${previewHeading}`);
  await page.keyboard.press("Enter");
  await page.keyboard.type("- list item");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.keyboard.type("`inline code`");

  await expect(editor.getByRole("heading", { name: previewHeading })).toBeVisible();
  await expect(editor.getByRole("listitem")).toContainText("list item");
  await expect(editor.locator("code")).toContainText("inline code");
});

test("CE-05: rich mode is an editable Tiptap surface backed by the same Markdown body", async ({
  page,
}) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });
  await createLocalMarkdownDocument(page, `CE 05 export ${Date.now()}`);

  const richEditor = richMarkdownEditor(page);
  const richText = `Rich edit ${Date.now()}`;

  await expect(page.getByTestId("editor-rich-tiptap-surface")).toBeVisible();
  await richEditor.click();
  await page.keyboard.insertText(richText);

  await page.getByTestId("markdown-export-button").click();
  await expect(page.getByTestId("markdown-export-output")).toContainText(richText);
});

test("CE-05: editor toolbar exposes dense Markdown controls on the collaboration editor", async ({
  page,
}) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });
  await createLocalMarkdownDocument(page, `CE 05 toolbar ${Date.now()}`);

  const editor = richMarkdownEditor(page);
  const heading = `Toolbar heading ${Date.now()}`;

  await expect(page.getByTestId("editor-format-toolbar")).toBeVisible();
  await expect(page.getByTestId("editor-undo-button")).toHaveAttribute(
    "data-undo-source",
    "collaboration",
  );
  await expect(page.getByTestId("editor-link-button")).toBeVisible();
  await expect(page.getByTestId("editor-task-button")).toBeVisible();
  await expect(page.getByTestId("editor-image-button")).toBeVisible();

  await editor.click();
  await page.getByTestId("editor-heading-button").click();
  await page.keyboard.insertText(heading);
  await expect(editor.getByRole("heading", { name: heading })).toBeVisible();

  await page.keyboard.press("Enter");
  await page.getByTestId("editor-bullet-list-button").click();
  await page.keyboard.insertText("toolbar bullet");
  await expect(editor.getByRole("listitem")).toContainText("toolbar bullet");

  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.getByTestId("editor-inline-code-button").click();
  await page.keyboard.insertText("toolbar_code");
  await expect(editor.locator("code")).toContainText("toolbar_code");
});

test("CE-05: toolbar undo and redo operate on the real editor content", async ({ page }) => {
  await openReviewerSession(page, {
    member: "alice",
    documentId: uniqueReviewDocumentId("ce-05-undo-redo"),
  });

  const editor = richMarkdownEditor(page);
  const undoRedoText = `undo redo content ${Date.now()}`;

  await expect(page.getByTestId("sync-status")).toContainText("synced", {
    ignoreCase: true,
    timeout: 10_000,
  });
  await expect(page.getByTestId("editor-undo-button")).toHaveAttribute(
    "data-undo-source",
    "collaboration",
  );
  await editor.click();
  await page.keyboard.insertText(undoRedoText);
  await expect(editor).toContainText(undoRedoText);

  await page.getByTestId("editor-undo-button").click();
  await expect(editor).not.toContainText(undoRedoText);

  await page.getByTestId("editor-redo-button").click();
  await expect(editor).toContainText(undoRedoText);
});

test("CE-05: image insertion uploads through the document artifact API", async ({ page }) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });
  await createLocalMarkdownDocument(page, `CE 05 image ${Date.now()}`);

  await page.getByTestId("editor-image-input").setInputFiles({
    name: "toolbar-image.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64",
    ),
  });

  await expect(richMarkdownEditor(page)).toContainText("toolbar image");
  await page.getByTestId("markdown-export-button").click();
  await expect(page.getByTestId("markdown-export-output")).toContainText("![toolbar image](");
  await expect(page.getByTestId("markdown-export-output")).toContainText(
    "rme-artifact://documents/",
  );
});
