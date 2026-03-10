import { type Page, expect } from '@playwright/test';

/** Log in with a valid email and password, then wait for the sidebar to appear. */
export async function login(page: Page, email = 'test@example.com', password = 'password123') {
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('submit-btn').click();
  await page.getByTestId('sidebar').waitFor();
}

/** Navigate to a page via the sidebar after logging in. */
export async function navigateTo(page: Page, name: 'dashboard' | 'users' | 'wizard' | 'kanban') {
  await page.getByTestId(`nav-${name}`).click();
}

/** Wait for a toast notification to appear with the given text (partial match). */
export async function expectToast(page: Page, text: string | RegExp) {
  const toast = page.getByRole('alert').filter({ hasText: text });
  await expect(toast).toBeVisible({ timeout: 5000 });
}
