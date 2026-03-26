import { expect, test } from "@playwright/test";
import { mockDefaultApi } from "./support/mockApi";

test.beforeEach(async ({ page }) => {
  await mockDefaultApi(page);
});

test("shows mocked AI results after submitting a prompt", async ({ page }) => {
  await page.goto("/ai-search");

  await expect(
    page.getByRole("heading", { name: /Use ✨ AI to search for games/i }),
  ).toBeVisible();

  await page.getByLabel("Search for a game").fill("Cozy RPG on Game Boy");
  await page.getByRole("button", { name: "Submit AI search" }).click();

  await expect(page.getByText(/Found 1 cozy RPG on Game Boy/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Golden Sun" })).toBeVisible();

  await page.pause();
});
