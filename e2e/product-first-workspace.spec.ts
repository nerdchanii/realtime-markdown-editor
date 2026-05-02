import { expect, test } from "@playwright/test";

import { createProductSession, ensureStandaloneProductUser } from "./support/product-fixtures.js";

test("Product: account without workspace can create its first workspace", async ({ page }) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `first-workspace-${suffix}@example.test`;
  const workspaceName = `First Workspace ${suffix}`;

  await ensureStandaloneProductUser(
    email,
    "First Workspace User",
    `user_first_workspace_${suffix}`,
  );
  await createProductSession(page, email);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Create your first workspace" })).toBeVisible();
  await page.getByLabel("Workspace name").fill(workspaceName);
  await page.getByRole("button", { name: "Create workspace" }).click();

  await expect(page.getByText("No workspace documents available.")).toBeVisible();

  const response = await page.request.get(`${apiBaseUrl()}/workspaces`);
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { workspaces: Array<{ name: string }> };
  expect(body.workspaces.some((workspace) => workspace.name === workspaceName)).toBeTruthy();
});

function apiBaseUrl() {
  return (
    process.env.RME_API_BASE_URL ?? process.env.VITE_RME_API_BASE_URL ?? "http://127.0.0.1:4000"
  );
}
