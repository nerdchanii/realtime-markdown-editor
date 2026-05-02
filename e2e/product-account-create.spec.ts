import { expect, test } from "@playwright/test";

test("Product: new user can create a local account and reach workspace onboarding", async ({
  page,
}) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `account-create-${suffix}@example.test`;

  await page.goto("/");
  await page.getByRole("button", { name: "Create an account" }).click();
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Name").fill("Account Create User");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "Create your first workspace" })).toBeVisible();
});
