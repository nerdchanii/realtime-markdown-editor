import { expect, test } from "@playwright/test";

import {
  createProductSession,
  ensureStandaloneProductUser,
  reviewerWorkspaceId,
} from "./support/product-fixtures.js";
import { openReviewerSession, uniqueReviewDocumentId } from "./support/reviewer-session.js";

test("Product: owner can add, promote, and remove a workspace member", async ({
  browser,
  page,
}) => {
  const documentId = uniqueReviewDocumentId("workspace-members");
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const memberEmail = `member-${suffix}@example.test`;
  const memberName = `Member ${suffix}`;

  await ensureStandaloneProductUser(memberEmail, memberName, `user_member_${suffix}`);
  await openReviewerSession(page, { member: "alice", documentId });
  await expect(page.getByTestId("document-title")).toHaveValue(titleFromDocumentId(documentId));

  await page.getByLabel("Open profile menu").click();
  await page.getByRole("button", { name: "Workspace settings" }).click();
  await page.getByLabel("New member email").fill(memberEmail);
  await page.getByRole("button", { name: "Add member" }).click();
  await expect(page.getByText("Member added.")).toBeVisible();
  await expect(page.getByText(memberName)).toBeVisible();

  await page.getByLabel(`Role for ${memberName}`).selectOption("owner");
  await expect(page.getByText("Member role saved.")).toBeVisible();

  const memberContext = await browser.newContext();
  const memberPage = await memberContext.newPage();
  await createProductSession(memberPage, memberEmail, reviewerWorkspaceId);
  await memberPage.goto(`/?workspace=${reviewerWorkspaceId}&document=${documentId}`);
  await expect(memberPage.getByTestId("document-title")).toHaveValue(
    titleFromDocumentId(documentId),
  );

  await page.getByRole("button", { name: "Remove" }).filter({ hasText: "Remove" }).last().click();
  await expect(page.getByText("Member removed.")).toBeVisible();

  const deniedNavigation = await memberPage.request.get(
    `${apiBaseUrl()}/workspaces/${reviewerWorkspaceId}/navigation`,
  );
  expect(deniedNavigation.status()).toBe(403);

  await memberContext.close();
});

function titleFromDocumentId(documentId: string) {
  return documentId.replace(/[_-]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function apiBaseUrl() {
  return (
    process.env.RME_API_BASE_URL ?? process.env.VITE_RME_API_BASE_URL ?? "http://127.0.0.1:4000"
  );
}
