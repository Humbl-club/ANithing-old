import { test, expect } from '@playwright/test';

// Very light smoke to run in CI safely under Vitest; playwright tests should run with Playwright runner, not Vitest.
test('homepage smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('nav')).toBeVisible();
});
