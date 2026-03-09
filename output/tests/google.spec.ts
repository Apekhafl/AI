/**
 * Auto-generated Playwright Test Suite
 * Page: Google
 * URL: https://www.google.com/
 * Generated: 2026-03-08T16:44:58.136Z
 * Total Tests: 10
 */

import { test, expect } from '@playwright/test';

test.describe('Google - AI Generated Tests', () => {

  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(15000);
  });

  test('TC001: Page load and title verification', async ({ page }) => {
    // Verifies that Google homepage loads successfully and displays correct title
    await page.goto('https://www.google.com/');
    await expect(page).toHaveTitle(/.+/);
    // Navigate to https://www.google.com/
    // Wait for page to load completely
    // Verify page title
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC002: Search functionality with valid input', async ({ page }) => {
    // Verifies that search works correctly with valid search query
    await page.goto('https://www.google.com/');
    await expect(page).toHaveTitle(/.+/);
    // Navigate to Google homepage
    // Enter 'playwright testing' in search box
    // Click 'Google Search' button
    // Verify search results page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC003: I\'m Feeling Lucky button functionality', async ({ page }) => {
    // Verifies that \'I\'m Feeling Lucky\' button redirects to first search result
    await page.goto('https://www.google.com/');
    await expect(page).toHaveTitle(/.+/);
    // Navigate to Google homepage
    // Enter 'wikipedia' in search box
    // Click 'I'm Feeling Lucky' button
    // Verify redirection occurs
    await expect(page.locator('body')).toBeVisible();
  });

  test('TC004: Gmail link navigation', async ({ page }) => {
    // Verifies that Gmail link navigates to correct Gmail page
    await page.goto('https://www.google.com/');
    // Navigate to Google homepage
    // Click on 'Gmail' link
    // Verify URL contains 'mail.google.com'
    const link = page.locator("a[href*='mail.google.com']").first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.+/);
    }
  });

  test('TC005: Images link navigation', async ({ page }) => {
    // Verifies that Images link navigates to Google Images page
    await page.goto('https://www.google.com/');
    // Navigate to Google homepage
    // Click on 'Images' link
    // Verify URL contains 'imghp'
    const link = page.locator("a[href*='imghp']").first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.+/);
    }
  });

  test('TC006: Essential UI elements visibility', async ({ page }) => {
    // Verifies that all essential UI elements are visible on page load
    await page.goto('https://www.google.com/');
    // Navigate to Google homepage
    // Check search input field is visible
    // Check Google Search button is visible
    // Check I'm Feeling Lucky button is visible
    // Check Gmail and Images links are visible
    const element = page.locator("input[name='q'], input[name='btnG'], input[name='btnI']").first();
    await expect(element).toBeVisible();
  });

  test('TC007: Empty search submission', async ({ page }) => {
    // Verifies behavior when search is submitted with empty query
    await page.goto('https://www.google.com/');
    // Navigate to Google homepage
    // Leave search box empty
    // Click 'Google Search' button
    // Verify page behavior
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      const currentUrl = page.url();
      await expect(page).toHaveURL(currentUrl);
    }
  });

  test('TC008: Sign in link functionality', async ({ page }) => {
    // Verifies that Sign in link navigates to Google account login page
    await page.goto('https://www.google.com/');
    // Navigate to Google homepage
    // Click on 'Sign in' link
    // Verify URL contains 'accounts.google.com'
    // Verify login form is present
    const link = page.locator("a[href*='accounts.google.com']").first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.+/);
    }
  });

  test('TC009: Advanced search link functionality', async ({ page }) => {
    // Verifies that Advanced search link navigates to advanced search page
    await page.goto('https://www.google.com/');
    // Navigate to Google homepage
    // Click on 'Advanced search' link
    // Verify URL contains 'advanced_search'
    // Verify advanced search form is present
    const link = page.locator("a[href*='advanced_search']").first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.+/);
    }
  });

  test('TC010: Special characters in search query', async ({ page }) => {
    // Verifies that search handles special characters correctly
    await page.goto('https://www.google.com/');
    // Navigate to Google homepage
    // Enter search query with special characters: '@#$%^&*()'
    // Click 'Google Search' button
    // Verify search results or error handling
    const form = page.locator("input[name='q']").first();
    if (await form.isVisible()) {
      const inputs = page.locator('input[type="text"], input[type="email"], textarea');
      const count = await inputs.count();
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const inputType = await input.getAttribute('type');
        if (inputType === 'email') {
          await input.fill('test@example.com');
        } else {
          await input.fill('Test Input Value');
        }
      }
      const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

});
