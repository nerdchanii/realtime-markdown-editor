import { expect, test } from "@playwright/test";

import { openReviewerSession, seededReviewDocumentId } from "./support/reviewer-session.js";

test("Product: reviewer can add, edit, and delete a document property", async ({ page }) => {
  await openReviewerSession(page, { member: "alice", documentId: seededReviewDocumentId });

  await page.getByLabel("New property name").fill("Reviewer note");
  await page.getByRole("button", { name: "Add" }).click();

  const property = page.getByLabel("Reviewer note");
  await expect(property).toBeVisible();
  await property.fill("Ready for checkpoint");
  await expect(property).toHaveValue("Ready for checkpoint");

  await page.getByTestId("delete-property-reviewer-note").click();
  await expect(property).toBeHidden();
});
