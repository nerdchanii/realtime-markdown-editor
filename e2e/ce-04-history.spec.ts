import { expect, test } from "@playwright/test";

import { appendRichEditorLine, richMarkdownEditor } from "./support/reviewer-session.js";
import { createProductSession, ensureCe04ProductFixture } from "./support/product-fixtures.js";

test("CE-04: reviewer can create and inspect a user-visible document revision", async ({
  page,
}) => {
  await ensureCe04ProductFixture();
  await createProductSession(page, "ce04-alice@example.test", "workspace_ce04");
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "rme:mock-markdown:document_ce04_plan",
      "# Stale local-only review plan",
    );
  });
  await page.goto("/?workspace=workspace_ce04&document=document_ce04_plan");

  const editor = richMarkdownEditor(page);
  const revisionText = `Revision candidate text ${Date.now()}`;
  const revisionMessage = `Capture review plan draft ${Date.now()}`;
  await expect(editor).toBeVisible();
  await expect(editor).toContainText("This document is loaded from product storage.");
  await expect(editor).not.toContainText("Stale local-only review plan");
  await appendRichEditorLine(page, editor, revisionText);

  await page.getByTestId("publish-revision-button").click();
  await page.getByTestId("revision-message-input").fill(revisionMessage);
  await page.getByTestId("confirm-publish-revision-button").click();

  await expect(page.getByTestId("revision-history-list")).toContainText(revisionMessage);
  await page.getByTestId("revision-history-item").filter({ hasText: revisionMessage }).click();
  await expect(page.getByTestId("revision-snapshot-viewer")).toContainText(revisionText);

  await page.reload();
  await expect(page.getByTestId("revision-history-list")).toContainText(revisionMessage);
});
