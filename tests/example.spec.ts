import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('hero-title')).toBeVisible();
});

test('navigation works', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Anime');
  await expect(page.locator('h1')).toContainText('Discover Anime');
});

test('search functionality', async ({ page }) => {
  await page.goto('/');
  const searchInput = page.getByTestId('search-input');
  await searchInput.fill('naruto');
  await expect(page.getByTestId('search-dropdown')).toBeVisible();
  await searchInput.press('Enter');
  await expect(page).toHaveURL(/\?search=/);
});

test('responsive design', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page.getByTestId('nav-main')).toBeVisible();
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload();
  await expect(page.getByTestId('nav-main')).toBeVisible();
});

test('offline functionality', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await context.setOffline(true);
  await page.goto('/anime');
  await expect(page.locator('body')).toBeVisible();
});