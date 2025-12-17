import { test, expect } from "@playwright/test";

test.describe("Timeframe Selection", () => {
  test("should default to 30 days", async ({ page }) => {
    await page.goto("/");

    const selector = page.getByRole("combobox");
    await expect(selector).toContainText("30 days");
  });

  test("should open dropdown when clicked", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("combobox").click();

    // Dropdown options should be visible
    await expect(page.getByRole("option", { name: "1 day" })).toBeVisible();
    await expect(page.getByRole("option", { name: "7 days" })).toBeVisible();
    await expect(page.getByRole("option", { name: "30 days" })).toBeVisible();
    await expect(page.getByRole("option", { name: "90 days" })).toBeVisible();
    await expect(page.getByRole("option", { name: "1 year" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Max" })).toBeVisible();
  });

  test("should change timeframe when option selected", async ({ page }) => {
    await page.goto("/");

    // Wait for initial load
    await page.waitForResponse(
      (resp) => resp.url().includes("/api/metrics") && resp.status() === 200,
    );

    // Click selector and choose 7 days
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "7 days" }).click();

    // Selector should now show 7 days
    await expect(page.getByRole("combobox")).toContainText("7 days");
  });

  test("should fetch new data when timeframe changes", async ({ page }) => {
    await page.goto("/");

    // Wait for initial load
    await page.waitForResponse(
      (resp) => resp.url().includes("/api/metrics") && resp.status() === 200,
    );

    // Change to 7 days and wait for new request
    await page.getByRole("combobox").click();

    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/metrics") && resp.status() === 200,
    );

    await page.getByRole("option", { name: "7 days" }).click();

    const response = await responsePromise;
    const requestBody = response.request().postDataJSON();

    expect(requestBody.timeframe).toBe("7");
  });

  test("should update chart when timeframe changes", async ({ page }) => {
    await page.goto("/");

    // Wait for initial chart
    await page.waitForResponse(
      (resp) => resp.url().includes("/api/metrics") && resp.status() === 200,
    );
    await expect(page.locator(".recharts-responsive-container")).toBeVisible();

    // Change timeframe
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "1 day" }).click();

    // Wait for new data
    await page.waitForResponse(
      (resp) => resp.url().includes("/api/metrics") && resp.status() === 200,
    );

    // Chart should still be visible
    await expect(page.locator(".recharts-responsive-container")).toBeVisible();
  });
});
