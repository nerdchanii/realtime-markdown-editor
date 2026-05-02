import { expect, test } from "@playwright/test";

import {
  createProductMarkdownDocument,
  exportCurrentMarkdown,
  markdownSurface,
  openCeDocument,
} from "./support/ce-acceptance.js";
import { seededReviewDocumentId } from "./support/reviewer-session.js";

test("CE-05: TipTap rich editor renders Markdown authoring shortcuts in the editable surface", async ({
  page,
}) => {
  await openCeDocument(page, { member: "alice", documentId: seededReviewDocumentId });
  await createProductMarkdownDocument(page, `CE 05 shortcuts ${Date.now()}`);

  const editor = markdownSurface(page);
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
  await expect(editor.getByRole("listitem").filter({ hasText: "list item" })).toBeVisible();
});

test("CE-05: rich mode is an editable Tiptap surface backed by the same Markdown body", async ({
  page,
}) => {
  await openCeDocument(page, { member: "alice", documentId: seededReviewDocumentId });
  await createProductMarkdownDocument(page, `CE 05 export ${Date.now()}`);

  const richEditor = markdownSurface(page);
  const richText = `Rich edit ${Date.now()}`;

  await expect(page.getByTestId("editor-rich-tiptap-surface")).toBeVisible();
  await richEditor.click();
  await page.keyboard.insertText(richText);

  expect(await exportCurrentMarkdown(page)).toContain(richText);
});
