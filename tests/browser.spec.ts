import { test } from '@playwright/test';

test('test browser', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.pause();
});

// # Desktop Safari
// npx playwright test browser.spec.ts --headed --project=webkit

// # iPhone
// npx playwright test browser.spec.ts --headed --project="Mobile Safari"
