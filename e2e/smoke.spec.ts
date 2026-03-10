import { test, expect } from '@playwright/test';

test('app loads and shows login page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/E2E Mayhem/);
  await expect(page.getByTestId('auth-form')).toBeVisible();
});
