import { expect, test } from "@playwright/test";

import {
  openReviewerSession,
  richMarkdownEditor,
  uniqueReviewDocumentId,
} from "./support/reviewer-session.js";

test("Product: reviewer can delete a document, find it in Trash, and restore it", async ({
  page,
}) => {
  const documentId = uniqueReviewDocumentId("document-trash");
  await openReviewerSession(page, { member: "alice", documentId });

  await expect(page.getByTestId("document-title")).toHaveValue(titleFromDocumentId(documentId));
  await page.getByTestId(`workspace-document-${documentId}`).hover();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByLabel(`Delete ${titleFromDocumentId(documentId)}`).click();

  await expect(page.getByTestId(`workspace-document-${documentId}`)).toBeHidden();
  await page.getByLabel("Open Trash").click();
  await expect(page.getByRole("region", { name: "Trash" })).toContainText(
    titleFromDocumentId(documentId),
  );

  await page.getByLabel(`Restore ${titleFromDocumentId(documentId)}`).click();

  await expect(page.getByTestId("document-title")).toHaveValue(titleFromDocumentId(documentId));
  await page.getByLabel("Close Trash").click();
  await expect(page.getByTestId(`workspace-document-${documentId}`)).toBeVisible();
  await expect(richMarkdownEditor(page)).toContainText(
    "This document is loaded from product storage.",
  );
});

function titleFromDocumentId(documentId: string) {
  return documentId.replace(/[_-]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
