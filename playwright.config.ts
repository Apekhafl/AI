import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          slowMo: 800,
        },
      },
    },
  ],
});