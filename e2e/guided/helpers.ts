import { type Page, expect } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/');
  await page.getByTestId('email-input').fill('test@example.com');
  await page.getByTestId('password-input').fill('password123');
  await page.getByTestId('submit-btn').click();
  await page.getByTestId('sidebar').waitFor();
}

export async function loginAndNavigate(page: Page, path: 'dashboard' | 'users' | 'wizard' | 'kanban') {
  await login(page);
  await page.getByTestId(`nav-${path}`).click();
  await expect(page).toHaveURL(new RegExp(`/${path}`));
}
