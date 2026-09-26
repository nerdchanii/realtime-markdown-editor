import { expect, test } from "@playwright/test";

import {
  openReviewerSession,
  richMarkdownEditor,
  seededReviewDocumentId,
} from "./support/reviewer-session.js";

// Skipped: 05411cd replaced the title-input create flow with "New document", which creates
// "Untitled document N" immediately. apps/web is scheduled for removal once apps/editor ships,
// so this spec is kept only until then instead of being rewritten.
test.skip("Product: reviewer can create a local Markdown document and open it", async ({
  page,
}) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });

  const title = `Local decision ${Date.now()}`;
  await page.getByLabel("New document title").fill(title);
  await page.getByTestId("create-document-button").click();

  await expect(page.getByTestId("document-title")).toHaveText(title);
  await expect(page.getByRole("button", { name: new RegExp(title) })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(richMarkdownEditor(page).getByRole("heading", { name: title })).toBeVisible();
});
