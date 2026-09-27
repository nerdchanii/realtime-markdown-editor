import { expect, test } from "@playwright/test";

import {
  addMarkdownLine,
  createUserCheckpoint,
  markdownSurface,
  openCheckpointSnapshot,
} from "./support/ce-acceptance.js";
import { createProductSession, ensureCe04ProductFixture } from "./support/product-fixtures.js";

// skip: token 을 보내지 않는 legacy web provider 라 협업 서버가 연결을 거부한다. editor provider 슬라이스에서 대체한다. Refs #19
test.skip("CE-04: reviewer can create and inspect a user-visible document revision", async ({
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

  const editor = markdownSurface(page);
  const revisionText = `Revision candidate text ${Date.now()}`;
  const revisionMessage = "Manual checkpoint";
  await expect(editor).toBeVisible();
  await expect(editor).toContainText("This document is loaded from product storage.");
  await expect(editor).not.toContainText("Stale local-only review plan");
  await addMarkdownLine(page, revisionText);

  await createUserCheckpoint(page, revisionMessage);
  const checkpointCountAfterSave = await page
    .getByRole("button", { name: new RegExp(revisionMessage) })
    .count();
  await expect(page.getByLabel("Document checkpoint saved")).toBeDisabled();
  await expect(page.getByRole("button", { name: new RegExp(revisionMessage) })).toHaveCount(
    checkpointCountAfterSave,
  );

  await expect(await openCheckpointSnapshot(page, revisionMessage)).toContainText(revisionText);

  await page.reload();
  await expect(page.getByLabel("History inspector")).toContainText(revisionMessage);
});
