import { expect, test } from "@playwright/test";

import { openReviewerSession, seededReviewDocumentId } from "./support/reviewer-session.js";

test("Product: reviewer can create a local Markdown document and open it", async ({ page }) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });

  const title = `Local decision ${Date.now()}`;
  await page.getByLabel("New document title").fill(title);
  await page.getByTestId("create-document-button").click();

  await expect(page.getByTestId("document-title")).toHaveText(title);
  await expect(page.getByRole("button", { name: new RegExp(title) })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByTestId("collaborative-markdown-editor")).toContainText(`# ${title}`);
});
