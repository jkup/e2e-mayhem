import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Toast Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('toast container is present in DOM', async ({ page }) => {
    await expect(page.getByTestId('toast-container')).toBeAttached();
  });

  test('clicking notifications button shows info toast', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    const toast = page.getByTestId('toast-info');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('unread notifications');
    await expect(toast).toHaveAttribute('role', 'alert');
  });

  test('toast has dismiss button', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    await expect(page.getByTestId('toast-dismiss').first()).toBeVisible();
  });

  test('dismissing a toast removes it', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    await expect(page.getByTestId('toast-info')).toBeVisible();
    await page.getByTestId('toast-dismiss').first().click();
    await expect(page.getByTestId('toast-info')).not.toBeVisible();
  });

  test('toast auto-dismisses after ~4 seconds', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    await expect(page.getByTestId('toast-info')).toBeVisible();
    // Wait for auto-dismiss (4s + buffer)
    await expect(page.getByTestId('toast-info')).not.toBeVisible({ timeout: 6000 });
  });

  test('multiple toasts stack in the container', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    await page.getByTestId('notifications-btn').click();
    const toasts = page.getByTestId('toast-container').locator('[role="alert"]');
    const count = await toasts.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('error toast uses correct styling (red background)', async ({ page }) => {
    // Navigate to users page and trigger a delete to get an error toast
    await page.getByTestId('nav-users').click();
    const firstRowActions = page.locator('[data-testid$="-trigger"]').filter({ hasText: '⋯' }).first();
    await firstRowActions.click();
    const menu = page.locator('[data-testid$="-menu"]').last();
    await menu.locator('button').nth(2).click(); // Delete
    await page.getByTestId('confirm-delete').click();
    const errorToast = page.getByTestId('toast-error');
    await expect(errorToast).toBeVisible();
    // Error toast should have bg-red-500 class (but there's a bug where it uses bg-green-500)
    await expect(errorToast).toHaveClass(/bg-red-500/);
  });

  test('success toast has green background', async ({ page }) => {
    // Navigate to wizard and complete it to trigger success toast
    await page.getByTestId('nav-kanban').click();
    await page.getByTestId('add-task-todo').click();
    await page.getByTestId('new-task-input').fill('Success test');
    await page.getByTestId('save-new-task').click();
    const successToast = page.getByTestId('toast-success');
    await expect(successToast).toBeVisible();
    await expect(successToast).toHaveClass(/bg-green-500/);
  });

  test('toast dismiss button has correct aria-label', async ({ page }) => {
    await page.getByTestId('notifications-btn').click();
    await expect(page.getByTestId('toast-dismiss').first()).toHaveAttribute('aria-label', 'Dismiss notification');
  });
});
