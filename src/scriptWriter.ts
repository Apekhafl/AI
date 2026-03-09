import * as fs from "fs";
import * as path from "path";
import { GeneratedTestSuite, TestCase } from "./aiGenerator";

const OUTPUT_DIR = path.join(process.cwd(), "output", "tests");

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeTestName(name: string): string {
  return name
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ")
    .replace(/\r/g, " ");
}

function generateTestBlock(testCase: TestCase, url: string): string {
  const steps = testCase.steps.map((step) => `    // ${step}`).join("\n");
  const escapedName = escapeTestName(testCase.name);
  const escapedDescription = escapeTestName(testCase.description);

  switch (testCase.category) {
    case "navigation": return generateNavigationTest(testCase, url, steps, escapedName, escapedDescription);
    case "form":       return generateFormTest(testCase, url, steps, escapedName, escapedDescription);
    case "negative":   return generateNegativeTest(testCase, url, steps, escapedName, escapedDescription);
    case "ui":         return generateUITest(testCase, url, steps, escapedName, escapedDescription);
    default:           return generateFunctionalTest(testCase, url, steps, escapedName, escapedDescription);
  }
}

function generateFunctionalTest(tc: TestCase, url: string, steps: string, name: string, description: string): string {
  return `
  test('${tc.id}: ${name}', async ({ page }) => {
    // ${description}
    await page.goto('${url}');
    await expect(page).toHaveTitle(/.+/);
${steps}
    await expect(page.locator('body')).toBeVisible();
  });`;
}

function generateNavigationTest(tc: TestCase, url: string, steps: string, name: string, description: string): string {
  const selector = tc.selector || "a";
  return `
  test('${tc.id}: ${name}', async ({ page }) => {
    // ${description}
    await page.goto('${url}');
${steps}
    const link = page.locator("${selector}").first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.+/);
    }
  });`;
}

function generateFormTest(tc: TestCase, url: string, steps: string, name: string, description: string): string {
  const selector = tc.selector || "form";
  return `
  test('${tc.id}: ${name}', async ({ page }) => {
    // ${description}
    await page.goto('${url}');
${steps}
    const form = page.locator("${selector}").first();
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
  });`;
}

function generateNegativeTest(tc: TestCase, url: string, steps: string, name: string, description: string): string {
  return `
  test('${tc.id}: ${name}', async ({ page }) => {
    // ${description}
    await page.goto('${url}');
${steps}
    const submitBtn = page.locator('button[type="submit"], input[type="submit"]').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      const currentUrl = page.url();
      await expect(page).toHaveURL(currentUrl);
    }
  });`;
}

function generateUITest(tc: TestCase, url: string, steps: string, name: string, description: string): string {
  const selector = tc.selector || "h1";
  return `
  test('${tc.id}: ${name}', async ({ page }) => {
    // ${description}
    await page.goto('${url}');
${steps}
    const element = page.locator("${selector}").first();
    await expect(element).toBeVisible();
  });`;
}

export function writeTestFile(suite: GeneratedTestSuite): string {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const fileName = `${sanitizeFileName(suite.pageTitle || "generated")}.spec.ts`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  const testBlocks = suite.testCases
    .map((tc) => generateTestBlock(tc, suite.url))
    .join("\n");

  const fileContent = `/**
 * Auto-generated Playwright Test Suite
 * Page: ${suite.pageTitle}
 * URL: ${suite.url}
 * Generated: ${suite.generatedAt}
 * Total Tests: ${suite.testCases.length}
 */

import { test, expect } from '@playwright/test';

test.describe('${suite.pageTitle} - AI Generated Tests', () => {

  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(30000);
  });
${testBlocks}

});
`;

  fs.writeFileSync(filePath, fileContent, "utf-8");
  console.log(`📝 Test file written: ${filePath}`);
  return filePath;
}