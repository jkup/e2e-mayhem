import { test, expect } from '@playwright/test';
import { login, expectToast } from './helpers';

test.describe('Toast Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await login(page);
  });

  test('toast container exists in the DOM', async ({ page }) => {
    await expect(page.getByTestId('toast-container')).toBeAttached();
  });

  test('toast appears when notifications button clicked', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    const toast = page.getByRole('alert');
    await expect(toast).toBeVisible();
  });

  test('toast can be dismissed by clicking dismiss button', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    const toast = page.getByRole('alert');
    await expect(toast).toBeVisible();
    await page.getByTestId('toast-dismiss').click();
    await expect(toast).not.toBeVisible();
  });

  test('toast auto-dismisses after ~4 seconds', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    const toast = page.getByRole('alert');
    await expect(toast).toBeVisible();
    // Wait for auto-dismiss (4000ms + buffer)
    await expect(toast).not.toBeVisible({ timeout: 6000 });
  });

  test('toast has correct type styling for info', async ({ page }) => {
    // Notifications button triggers an info toast
    await page.getByTestId('notifications-btn').click();
    const toast = page.getByTestId('toast-info');
    await expect(toast).toBeVisible();
    await expect(toast).toHaveClass(/bg-blue-500/);
  });

  test('error toast uses red background (not green)', async ({ page }) => {
    // Navigate to users page and delete a user to trigger an error toast
    await page.getByTestId('nav-users').click();
    const firstRowActions = page.locator('tbody tr').first().locator('[data-testid^="user-actions-"]');
    await firstRowActions.locator('[data-testid$="-trigger"]').click();
    await firstRowActions.locator('[data-testid$="-item-2"]').click(); // Delete
    await page.getByTestId('confirm-delete').click();

    const errorToast = page.getByTestId('toast-error');
    await expect(errorToast).toBeVisible();
    // Error toast should have red background, not green
    await expect(errorToast).toHaveClass(/bg-red-500/);
  });

  test('toast has role="alert" for accessibility', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    const toast = page.getByRole('alert');
    await expect(toast).toBeVisible();
  });

  test('toast dismiss button has correct aria-label', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    const dismissBtn = page.getByTestId('toast-dismiss');
    await expect(dismissBtn).toHaveAttribute('aria-label', 'Dismiss notification');
  });
});
