import { expect, test } from "@playwright/test";
import { mockDefaultApi } from "./support/mockApi";

test.beforeEach(async ({ page }) => {
  await mockDefaultApi(page);
});

test("lets the user switch between login and signup modes", async ({
  page,
}) => {
  await page.goto("/auth?mode=login");

  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/mode=signup/);
  await expect(
    page.getByRole("heading", { name: "Create a new user" }),
  ).toBeVisible();
});
