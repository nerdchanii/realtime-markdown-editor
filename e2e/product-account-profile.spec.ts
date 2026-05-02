import { expect, test } from "@playwright/test";

import { openReviewerSession, uniqueReviewDocumentId } from "./support/reviewer-session.js";

test("Product: account settings update the signed-in user profile", async ({ page }) => {
  const documentId = uniqueReviewDocumentId("account-profile");
  const profileName = `Account User ${Date.now()}`;

  await openReviewerSession(page, { member: "alice", documentId });
  await expect(page.getByTestId("document-title")).toHaveValue(titleFromDocumentId(documentId));

  await page.getByLabel("Open profile menu").click();
  await page.getByRole("button", { name: "Account settings" }).click();
  await page.getByLabel("Name").fill(profileName);
  await page.getByRole("button", { name: "Save account" }).click();

  await expect(page.getByText("Account saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("document-title")).toHaveValue(titleFromDocumentId(documentId));
  await page.getByLabel("Open profile menu").click();
  await page.getByRole("button", { name: "Account settings" }).click();
  await expect(page.getByLabel("Name")).toHaveValue(profileName);
});

function titleFromDocumentId(documentId: string) {
  return documentId.replace(/[_-]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
