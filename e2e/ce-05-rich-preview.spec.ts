import { expect, test } from "@playwright/test";

import {
  createLocalMarkdownDocument,
  openReviewerSession,
  richMarkdownEditor,
  seededReviewDocumentId,
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
  await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
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
