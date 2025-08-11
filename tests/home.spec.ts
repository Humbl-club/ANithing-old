import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads and displays content', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section
    await expect(page.getByTestId('hero-title')).toBeVisible();
    await expect(page.getByTestId('hero-subtitle')).toContainText('Discover Everything Anime');
    
    // Check navigation
    await expect(page.getByTestId('nav-main')).toBeVisible();
    
    // Check content cards exist
    await expect(page.getByTestId('card').first()).toBeVisible();
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('/');
    
    // Search for content
    const input = page.getByTestId('search-input');
    await input.fill('Naruto');
    
    // Dropdown appears with options
    await expect(page.getByTestId('search-dropdown')).toBeVisible();
    await expect(page.getByTestId('search-option').first()).toBeVisible();
    
    // Press Enter to navigate to results page
    await input.press('Enter');
    await expect(page).toHaveURL(/\?search=/);
  });
});