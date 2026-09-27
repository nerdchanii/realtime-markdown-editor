import { expect, test, type Page } from "@playwright/test";

import { openReviewerSession, uniqueReviewDocumentId } from "./support/reviewer-session.js";

test("Product: reviewer can add, edit, and delete a document property", async ({ page }) => {
  const documentId = uniqueReviewDocumentId("document-properties");
  await openReviewerSession(page, { member: "alice", documentId });

  const properties = page.getByTestId("document-properties");
  await properties.getByRole("button", { name: "Add document property" }).click();

  const keySaved = propertiesSaved(page, "Reviewer note");
  await properties.getByLabel("Property key 1").fill("Reviewer note");
  await keySaved;

  const valueSaved = propertiesSaved(page, "Ready for checkpoint");
  await properties.getByLabel("Reviewer note value").fill("Ready for checkpoint");
  await valueSaved;

  await page.reload();
  const reloaded = page.getByTestId("document-properties");
  await expect(reloaded.getByLabel("Property key 1")).toHaveValue("Reviewer note");
  await expect(reloaded.getByLabel("Reviewer note value")).toHaveValue("Ready for checkpoint");

  await reloaded.getByLabel("Remove Reviewer note").click();
  await expect(reloaded.getByLabel("Property key 1")).toBeHidden();
});

function propertiesSaved(page: Page, expectedText: string) {
  return page.waitForResponse(
    (response) =>
      response.url().endsWith("/properties") &&
      response.request().method() === "PUT" &&
      (response.request().postData() ?? "").includes(expectedText) &&
      response.ok(),
  );
}
