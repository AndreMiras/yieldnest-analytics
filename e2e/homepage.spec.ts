import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load and display title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/YieldNest Analytics/);
  });

  test("should display header with logo", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /YieldNest Analytics/ }),
    ).toBeVisible();
  });

  test("should display metrics cards", async ({ page }) => {
    await page.goto("/");

    // Wait for API response
    await page.waitForResponse(
      (resp) => resp.url().includes("/api/metrics") && resp.status() === 200,
    );

    // Metrics cards should be visible
    await expect(page.getByText("Current Exchange Rate")).toBeVisible();
    await expect(page.getByText("Current APY")).toBeVisible();
  });

  test("should display exchange rate with decimals", async ({ page }) => {
    await page.goto("/");

    // Wait for data to load
    await page.waitForResponse(
      (resp) => resp.url().includes("/api/metrics") && resp.status() === 200,
    );

    // Exchange rate should show a decimal number
    const exchangeRateCard = page
      .getByText("Current Exchange Rate")
      .locator("..");
    await expect(exchangeRateCard).toContainText(/\d+\.\d{4}/);
  });

  test("should display chart", async ({ page }) => {
    await page.goto("/");

    // Wait for data to load
    await page.waitForResponse(
      (resp) => resp.url().includes("/api/metrics") && resp.status() === 200,
    );

    // Chart container should be visible
    await expect(page.locator(".recharts-responsive-container")).toBeVisible();
  });
});
