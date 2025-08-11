import { test, expect } from '@playwright/test';

test.describe('Anime Detail Page', () => {
  test('displays anime information', async ({ page }) => {
    // Go to a specific anime page
    await page.goto('/anime');
    
    // Click first anime card
    await page.getByTestId('card').first().click();
    
    // Check detail page elements
    await expect(page.getByTestId('detail-title')).toBeVisible();
    await expect(page.getByTestId('detail-synopsis-title')).toBeVisible();
    await expect(page.getByTestId('add-to-list-btn')).toBeVisible();
  });

  test('add to list functionality', async ({ page, context }) => {
    // Mock auth cookie (basic)
    await context.addCookies([{ name: 'auth-token', value: 'mock-token', domain: 'localhost', path: '/' }]);
    
    await page.goto('/anime');
    await page.getByTestId('card').first().click();
    
    // Click add to list trigger
    await page.getByTestId('add-to-list-btn').click();
    
    // Menu should appear
    await expect(page.getByTestId('add-to-list-menu')).toBeVisible();
  });
});