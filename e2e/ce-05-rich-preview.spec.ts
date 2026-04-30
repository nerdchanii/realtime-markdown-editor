import { expect, test } from "@playwright/test";

import {
  appendMarkdownLine,
  openReviewerSession,
  seededReviewDocumentId,
} from "./support/reviewer-session.js";

test("CE-05: split preview renders current Markdown without losing source content", async ({
  page,
}) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });

  const editor = page.getByTestId("collaborative-markdown-editor");
  const previewHeading = `Preview heading ${Date.now()}`;
  await expect(editor).toBeVisible();
  await appendMarkdownLine(
    page,
    editor,
    `# ${previewHeading}\n\n- list item\n\n\`inline code\`\n\n[link](https://example.com)`,
  );

  await page.getByRole("button", { name: "Split" }).click();

  const preview = page.getByTestId("markdown-rich-preview");
  await expect(preview.getByRole("heading", { name: previewHeading })).toBeVisible();
  await expect(preview).toContainText("list item");
  await expect(preview).toContainText("inline code");
  await expect(preview.getByRole("link", { name: "link" })).toHaveAttribute(
    "href",
    "https://example.com",
  );
  await expect(editor).toContainText(`# ${previewHeading}`);
});
