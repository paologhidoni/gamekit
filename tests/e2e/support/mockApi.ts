import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const aiSearchSuccess = JSON.parse(
  readFileSync(new URL("../../fixtures/ai-search-success.json", import.meta.url), "utf-8"),
);
const askAiSuccess = JSON.parse(
  readFileSync(new URL("../../fixtures/ask-ai-success.json", import.meta.url), "utf-8"),
);
const rateLimitSuccess = JSON.parse(
  readFileSync(new URL("../../fixtures/rate-limit-success.json", import.meta.url), "utf-8"),
);

export async function mockDefaultApi(page: Page): Promise<void> {
  await page.route("**/api/rate-limit", async (route) => {
    await route.fulfill({ json: rateLimitSuccess });
  });

  await page.route("**/api/ai-search?*", async (route) => {
    await route.fulfill({ json: aiSearchSuccess });
  });

  await page.route("**/api/ask-ai", async (route) => {
    await route.fulfill({ json: askAiSuccess });
  });
}
