import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate home when clicking logo", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /YieldNest Analytics/ }).click();

    await expect(page).toHaveURL("/");
  });

  test("should have GitHub link in header", async ({ page }) => {
    await page.goto("/");

    const aboutLink = page.getByRole("link", { name: /About/ });
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toHaveAttribute(
      "href",
      "https://github.com/AndreMiras/yieldnest-analytics",
    );
  });

  test("should open GitHub link in new tab", async ({ page }) => {
    await page.goto("/");

    const aboutLink = page.getByRole("link", { name: /About/ });
    await expect(aboutLink).toHaveAttribute("target", "_blank");
  });

  test("should display card title", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("ynETH Performance vs ETH")).toBeVisible();
  });
});
