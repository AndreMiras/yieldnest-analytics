import { test, expect } from "@playwright/test";

test.describe("Error Handling", () => {
  test("should handle API errors gracefully", async ({ page }) => {
    // Mock API to return error
    await page.route("**/api/metrics", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/");

    // Page should still render header
    await expect(
      page.getByRole("link", { name: /YieldNest Analytics/ }),
    ).toBeVisible();

    // Card should still be visible
    await expect(page.getByText("ynETH Performance vs ETH")).toBeVisible();
  });

  test("should handle empty API response", async ({ page }) => {
    // Mock API to return empty data
    await page.route("**/api/metrics", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: { metricsSnapshots: [] } }),
      });
    });

    await page.goto("/");

    // Page should still render
    await expect(
      page.getByRole("link", { name: /YieldNest Analytics/ }),
    ).toBeVisible();

    // Metrics cards should show default/empty state
    await expect(page.getByText("Current Exchange Rate")).toBeVisible();
  });

  test("should handle slow API response", async ({ page }) => {
    // Mock API with delay
    await page.route("**/api/metrics", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            metricsSnapshots: [
              { timestamp: "1702800000", exchangeRate: "1.0500" },
            ],
          },
        }),
      });
    });

    await page.goto("/");

    // Page should render while waiting
    await expect(
      page.getByRole("link", { name: /YieldNest Analytics/ }),
    ).toBeVisible();

    // Eventually metrics should appear
    await expect(page.getByText("Current Exchange Rate")).toBeVisible({
      timeout: 5000,
    });
  });
});
